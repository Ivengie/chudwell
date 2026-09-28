import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BookCard from "../components/BookCard.jsx";
import { useLibrary } from "../context/LibraryContext.jsx";
import { s } from "../utils.js";

// Results are computed from the URL (#/search?mode=...), so a refresh keeps them.
function filterBooks(books, p) {
  const get = (k) => (p.get(k) || "").trim().toLowerCase();
  const mode = p.get("mode");

  if (mode === "advanced") {
    const min = Number(p.get("min")) || 0;
    const max = Number(p.get("max")) || Infinity;
    return books.filter(
      (b) =>
        (!get("title") || b.title.toLowerCase().includes(get("title"))) &&
        (!get("author") || b.author.toLowerCase().includes(get("author"))) &&
        b.words >= min && b.words <= max
    );
  }

  if (mode === "browse") {
    const keyword = get("keyword");
    const status = p.get("status") || "all";
    const tags = get("tags").split(",").filter(Boolean);
    const sort = p.get("sort") || "likes";
    const asc = p.get("order") === "ascending";
    const value = (b) => (sort === "word count" ? b.words : sort === "latest update" ? b.id : b.hearts);
    return books
      .filter(
        (b) =>
          (!keyword || b.title.toLowerCase().includes(keyword) || b.author.toLowerCase().includes(keyword)) &&
          (status === "all" || b.status === status) &&
          (!tags.length || tags.some((t) => b.tags?.includes(t)))
      )
      .sort((a, b) => (asc ? value(a) - value(b) : value(b) - value(a)));
  }

  const q = get("q");
  return q ? books.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)) : [];
}

export default function SearchResultsPage() {
  const { books } = useLibrary();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const results = useMemo(() => filterBooks(books, params), [books, params]);

  return (
    <section className="page-view active">
      <div style={s("display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px")}>
        <h2 style={s("font-family: 'Playfair Display'; font-size: 28px; margin: 0")}>Search Results</h2>
        <button className="btn-primary" style={s("width: auto; padding: 6px 16px")} onClick={() => navigate("/")}>← Back to Home</button>
      </div>
      <div className="books-grid">
        {results.length ? (
          results.map((book) => <BookCard key={book.id} book={book} />)
        ) : (
          <p style={s("color: var(--muted); grid-column: span 4")}>No matching stories found.</p>
        )}
      </div>
    </section>
  );
}
