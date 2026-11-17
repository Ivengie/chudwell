import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { STORAGE } from "../config.js";
import { defaultBooks, defaultReaderData } from "../data/seed.js";
import { countWords, load, sameId, save } from "../utils.js";

const LibraryContext = createContext(null);

const DEFAULT_LISTS = [
  { name: "Liked Books", icon: "🧡", books: [1, 3] },
  { name: "reading list 1", icon: "📚", books: [] },
];

export function LibraryProvider({ children }) {
  const [rawBooks, setRawBooks] = useState(() => ({ ...defaultBooks, ...load(STORAGE.books, {}) }));
  const [readerData, setReaderData] = useState(() => {
    const stored = { ...defaultReaderData, ...load(STORAGE.reader, {}) };
    return Object.fromEntries(
      Object.entries(stored).map(([id, book]) => {
        const seed = defaultReaderData[id];
        return [id, seed && !book?.chapters?.length ? { ...seed, ...book, chapters: seed.chapters } : book];
      })
    );
  });
  const [lists, setLists] = useState(() => load(STORAGE.lists, DEFAULT_LISTS));
  const [drafts, setDrafts] = useState(() => load(STORAGE.drafts, []));
  const [published, setPublished] = useState(() => load(STORAGE.published, []));

  useEffect(() => save(STORAGE.books, rawBooks), [rawBooks]);
  useEffect(() => save(STORAGE.reader, readerData), [readerData]);
  useEffect(() => save(STORAGE.lists, lists), [lists]);
  useEffect(() => save(STORAGE.drafts, drafts), [drafts]);
  useEffect(() => save(STORAGE.published, published), [published]);

  // Stats (words, likes, labels) are derived, never stored.
  const books = useMemo(
    () =>
      Object.entries(rawBooks).map(([key, b]) => {
        const chapters = readerData[key]?.chapters || [];
        const words = countWords(b.synopsis) + chapters.reduce((n, c) => n + countWords(c.text), 0);
        const hearts = chapters.reduce((n, c) => n + Number(c.likes || 0), 0);
        return {
          ...b,
          id: Number(key),
          words,
          hearts,
          statusStr: `• ${(b.status || "ongoing").toUpperCase()}`,
          wordStr: `${words.toLocaleString()} words`,
          heartsStr: `♡ ${hearts.toLocaleString()}`,
        };
      }),
    [rawBooks, readerData]
  );
  const getBook = (id) => books.find((b) => sameId(b.id, id));

  // ---- reader: likes & comments
  const updateChapter = (bookId, index, fn) =>
    setReaderData((prev) => {
      const book = prev[bookId];
      if (!book?.chapters[index]) return prev;
      return { ...prev, [bookId]: { ...book, chapters: book.chapters.map((c, i) => (i === index ? fn(c) : c)) } };
    });

  const toggleLike = (bookId, index) =>
    updateChapter(bookId, index, (c) => ({
      ...c,
      likedByUser: !c.likedByUser,
      likes: c.likedByUser ? Math.max(0, (c.likes || 0) - 1) : (c.likes || 0) + 1,
    }));
  const addComment = (bookId, index, user, text) =>
    updateChapter(bookId, index, (c) => ({ ...c, comments: [...(c.comments || []), { user, text }] }));
  const deleteComment = (bookId, index, commentIndex) =>
    updateChapter(bookId, index, (c) => ({ ...c, comments: c.comments.filter((_, i) => i !== commentIndex) }));

  // ---- reading lists
  const setBookLists = (bookId, listIndexes) =>
    setLists((prev) =>
      prev.map((l, i) => {
        const others = l.books.filter((id) => id !== bookId);
        return { ...l, books: listIndexes.includes(i) ? [...others, bookId] : others };
      })
    );
  const createList = (name) => setLists((prev) => [...prev, { name, icon: "📖", books: [] }]);
  const renameList = (index, name) => setLists((prev) => prev.map((l, i) => (i === index ? { ...l, name } : l)));
  const removeFromList = (index, bookId) =>
    setLists((prev) => prev.map((l, i) => (i === index ? { ...l, books: l.books.filter((id) => id !== bookId) } : l)));

  // ---- writer studio
  const createDraft = (author) => {
    const id = Date.now();
    setReaderData((p) => ({ ...p, [id]: { title: "Untitled Story", chapters: [] } }));
    setDrafts((d) => [...d, { id, title: "Untitled Story", author: author || "Author", tag: "", tags: [], status: "ongoing", cover: "", synopsis: "" }]);
    return id;
  };
  const deleteDraft = (id) => {
    setReaderData((p) => {
      const { [id]: _removed, ...rest } = p;
      return rest;
    });
    setDrafts((d) => d.filter((x) => !sameId(x.id, id)));
  };
  // A draft that was just published moves lists, so fall through to published/featured.
  const getStudioBook = (id) =>
    drafts.find((d) => sameId(d.id, id)) || published.find((p) => sameId(p.id, id)) || getBook(id);

  const updateDetails = (id, { title, synopsis, tags, status, cover }) => {
    const patch = { title, synopsis, tags: tags.map((t) => t.toLowerCase()), tag: tags[0] || "", status, cover };
    const apply = (x) => (sameId(x.id, id) ? { ...x, ...patch } : x);
    setDrafts((d) => d.map(apply));
    setPublished((p) => p.map(apply));
    setRawBooks((b) => (b[id] ? { ...b, [id]: { ...b[id], ...patch } } : b));
    setReaderData((p) => (p[id] ? { ...p, [id]: { ...p[id], title } } : p));
  };

  const saveChapter = (id, index, { title, musicUrl, text }) =>
    setReaderData((prev) => {
      const book = prev[id] || { title: "", chapters: [] };
      const chapters =
        index === null
          ? [...book.chapters, { title, likes: 0, likedByUser: false, musicUrl, comments: [], text }]
          : book.chapters.map((c, i) => (i === index ? { ...c, title, musicUrl, text } : c));
      return { ...prev, [id]: { ...book, chapters } };
    });
  const deleteChapter = (id, index) =>
    setReaderData((prev) =>
      prev[id] ? { ...prev, [id]: { ...prev[id], chapters: prev[id].chapters.filter((_, i) => i !== index) } } : prev
    );

  // returns an error message, or null on success
  const publish = (id, type, author) => {
    const cover = type === "draft" ? drafts.find((d) => sameId(d.id, id))?.cover : rawBooks[id]?.cover;
    if (!cover) return "Publishing requires a cover image! Please upload a cover image first.";
    if (!readerData[id]?.chapters?.length) return "Publishing requires at least one written chapter! Please add a chapter first.";
    if (type === "draft") {
      const draft = drafts.find((d) => sameId(d.id, id));
      if (draft) {
        const pub = { ...draft, author: author || "Author" };
        setRawBooks((b) => ({ ...b, [draft.id]: pub }));
        setPublished((p) => [...p, pub]);
        setDrafts((d) => d.filter((x) => !sameId(x.id, id)));
      }
    }
    return null;
  };

  const value = {
    books, getBook, readerData, lists, drafts, published,
    toggleLike, addComment, deleteComment,
    setBookLists, createList, renameList, removeFromList,
    createDraft, deleteDraft, getStudioBook, updateDetails, saveChapter, deleteChapter, publish,
  };
  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export const useLibrary = () => useContext(LibraryContext);
