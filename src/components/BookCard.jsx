import { asset } from "../config.js";
import { useModal } from "../context/ModalContext.jsx";

export default function BookCard({ book }) {
  const { openModal } = useModal();
  return (
    <article className="book-card" onClick={() => openModal("book", { id: book.id })}>
      <button
        className="card-options-btn"
        title="Add to Reading List"
        onClick={(e) => { e.stopPropagation(); openModal("addToList", { bookId: book.id }); }}
      >
        ⋮
      </button>

      <div className="book-cover" style={{ background: `url('${asset(book.cover)}') center/cover` }}>
        <small>{book.tag || ""}</small>
        <strong>{book.title}</strong>
      </div>

      <div className="book-title">{book.title}</div>
      <div className="book-author">by {book.author}</div>

      <div className="meta">
        <span className="status">{book.statusStr}</span>
        <span>{book.wordStr}</span>
        <span>{book.heartsStr}</span>
      </div>
    </article>
  );
}
