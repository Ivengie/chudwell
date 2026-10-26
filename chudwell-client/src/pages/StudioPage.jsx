import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLibrary } from "../context/LibraryContext.jsx";
import { useModal } from "../context/ModalContext.jsx";
import { normalizeTags, s } from "../utils.js";

const EMPTY_CHAPTER = { title: "", musicUrl: "", text: "" };

export default function StudioPage() {
  const { type, bookId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getStudioBook, readerData, updateDetails, saveChapter, deleteChapter, publish } = useLibrary();
  const { openModal } = useModal();

  const book = getStudioBook(bookId, type);
  const chapters = readerData[bookId]?.chapters || [];

  const [details, setDetails] = useState({ title: "", synopsis: "", tags: "", status: "ongoing" });
  const [coverFile, setCoverFile] = useState(null);
  const [chapterForm, setChapterForm] = useState(EMPTY_CHAPTER);
  const [editingIndex, setEditingIndex] = useState(null);

  // Load the form when a different book is opened.
  useEffect(() => {
    if (!book) return;
    setDetails({
      title: book.title,
      synopsis: book.synopsis || "",
      tags: Array.isArray(book.tags) ? book.tags.join(", ") : book.tag || "",
      status: book.status || "ongoing",
    });
    setCoverFile(null);
    setChapterForm(EMPTY_CHAPTER);
    setEditingIndex(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, type, !!book]);

  if (!book) return <Navigate to="/" replace />;

  const setD = (k) => (e) => setDetails((d) => ({ ...d, [k]: e.target.value }));
  const setC = (k) => (e) => setChapterForm((c) => ({ ...c, [k]: e.target.value }));

  function finishDetails(cover) {
    updateDetails(bookId, { ...details, tags: normalizeTags(details.tags), cover });
    alert("Book details updated successfully!");
  }

  function saveDetails(e) {
    e.preventDefault();
    if (coverFile) {
      const reader = new FileReader();
      reader.onload = (evt) => finishDetails(evt.target.result);
      reader.readAsDataURL(coverFile);
      return;
    }
    if (!book.cover) return alert("A cover image is required!");
    finishDetails(book.cover);
  }

  function publishBook() {
    const error = publish(bookId, type, user.displayName);
    if (error) return alert(error);
    alert("Your book has been successfully published!");
    if (type === "draft") navigate(`/studio/published/${bookId}`, { replace: true });
  }

  function submitChapter(e) {
    e.preventDefault();
    const c = { title: chapterForm.title.trim(), musicUrl: chapterForm.musicUrl.trim(), text: chapterForm.text.trim() };
    if (!c.title || !c.text) return alert("Chapter title and content are required.");
    saveChapter(bookId, editingIndex, c);
    resetChapterForm();
    alert("Chapter saved successfully!");
  }

  function resetChapterForm() {
    setEditingIndex(null);
    setChapterForm(EMPTY_CHAPTER);
  }

  function editChapter(i) {
    const c = chapters[i];
    setEditingIndex(i);
    setChapterForm({ title: c.title, musicUrl: c.musicUrl || "", text: c.text });
  }

  function removeChapter(i) {
    if (!window.confirm("Are you sure you want to delete this chapter?")) return;
    deleteChapter(bookId, i);
    if (editingIndex === i) resetChapterForm();
  }

  const box = s("background: var(--chiffon); border: 1px solid var(--line); border-radius: 8px; padding: 20px");

  return (
    <section className="page-view active">
      <div className="writer-studio-container" style={s("max-width: 900px; margin: 30px auto; background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 28px; box-shadow: var(--shadow)")}>
        <div style={s("display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--line); padding-bottom: 16px")}>
          <div>
            <span id="studio-book-status-badge" style={s("padding: 4px 8px; border-radius: 999px; background: var(--blossom); color: var(--ink); font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em")}>{(book.status || "ongoing").toUpperCase()}</span>
            <h2 style={s("font-family: 'Playfair Display'; margin: 6px 0 0; font-size: 28px")}>{book.title}</h2>
          </div>
          <button className="btn-primary" style={s("width: auto; padding: 8px 18px; background: var(--muted)")} onClick={() => openModal("myBooks")}>← Back to My Books</button>
        </div>

        <div style={{ ...box, marginBottom: 32 }}>
          <h3 style={s("font-family: 'Playfair Display'; margin-top: 0; margin-bottom: 14px")}>Edit Book Details</h3>
          <form onSubmit={saveDetails}>
            <div className="form-group" style={s("margin-bottom: 12px")}>
              <label>Title</label>
              <input type="text" className="input-styled" required value={details.title} onChange={setD("title")} />
            </div>
            <div className="form-group" style={s("margin-bottom: 12px")}>
              <label>Synopsis</label>
              <textarea className="input-styled" rows={4} required value={details.synopsis} onChange={setD("synopsis")} />
            </div>
            <div style={s("display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px")}>
              <div className="form-group">
                <label>Tags (comma-separated, e.g. romance, fantasy)</label>
                <input type="text" className="input-styled" value={details.tags} onChange={setD("tags")} />
              </div>
              <div className="form-group">
                <label>Book Status</label>
                <select className="input-styled" value={details.status} onChange={setD("status")}>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={s("margin-bottom: 16px")}>
              <label>Cover Image (Required for Publishing)</label>
              <input type="file" accept="image/*" className="input-styled" style={s("padding: 6px")} onChange={(e) => setCoverFile(e.target.files[0] || null)} />
            </div>
            <div style={s("display: flex; gap: 12px")}>
              <button type="submit" className="btn-primary" style={s("width: auto; padding: 10px 20px")}>Save Book Details</button>
              <button type="button" className="btn-primary" style={s("width: auto; padding: 10px 20px; background: #2b7a4b")} onClick={publishBook}>Publish Book</button>
            </div>
          </form>
        </div>

        <div>
          <h3 style={s("font-family: 'Playfair Display'; margin-top: 0; margin-bottom: 14px")}>Chapters</h3>
          <div style={s("display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px")}>
            {!chapters.length && <p style={s("color: var(--muted); font-size: 13px")}>No chapters written yet. Write your first chapter below!</p>}
            {chapters.map((c, i) => (
              <div key={i} style={s("padding: 12px; background: var(--card); border: 1px solid var(--line); border-radius: 6px; display: flex; justify-content: space-between; align-items: center; color: var(--ink)")}>
                <div>
                  <strong style={s("font-size: 14px; display: block; margin-bottom: 2px")}>{c.title}</strong>
                  <span style={s("font-size: 11px; color: var(--muted)")}>{c.musicUrl ? "🎵 Song attached" : "No background music"}</span>
                </div>
                <div style={s("display: flex; gap: 8px")}>
                  <button className="btn-primary" style={s("padding: 4px 10px; font-size: 11px")} onClick={() => editChapter(i)}>Edit</button>
                  <button className="btn-primary" style={s("padding: 4px 10px; font-size: 11px; background: #b11f1f")} onClick={() => removeChapter(i)}>Delete</button>
                </div>
              </div>
            ))}
          </div>

          <div style={box}>
            <h4 style={s("margin-top: 0; font-family: 'Playfair Display'")}>{editingIndex === null ? "Add New Chapter" : `Edit Chapter ${editingIndex + 1}`}</h4>
            <form onSubmit={submitChapter}>
              <div className="form-group" style={s("margin-bottom: 12px")}>
                <label>Chapter Title</label>
                <input type="text" className="input-styled" placeholder="Chapter Title" required value={chapterForm.title} onChange={setC("title")} />
              </div>
              <div className="form-group" style={s("margin-bottom: 12px")}>
                <label>Background Song / Audio URL (Optional)</label>
                <input type="url" className="input-styled" placeholder="https://example.com/audio.mp3" value={chapterForm.musicUrl} onChange={setC("musicUrl")} />
              </div>
              <div className="form-group" style={s("margin-bottom: 16px")}>
                <label>Chapter Content</label>
                <textarea className="input-styled" rows={10} placeholder="Write your chapter here..." required value={chapterForm.text} onChange={setC("text")} />
              </div>
              <div style={s("display: flex; gap: 12px")}>
                <button type="submit" className="btn-primary" style={s("width: auto; padding: 10px 20px")}>Save Chapter</button>
                {editingIndex !== null && (
                  <button type="button" className="btn-primary" style={s("width: auto; padding: 10px 20px; background: var(--muted)")} onClick={resetChapterForm}>Cancel Edit</button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
