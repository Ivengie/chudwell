import { useNavigate } from "react-router-dom";
import { asset } from "../../config.js";
import { useLibrary } from "../../context/LibraryContext.jsx";
import { useModal } from "../../context/ModalContext.jsx";
import { formatTagString, s } from "../../utils.js";

// variant "history" (from Shelves) shows "Continue" instead of "Read"
export default function BookDetailModal({ id, variant = "book" }) {
  const { getBook } = useLibrary();
  const { closeModal } = useModal();
  const navigate = useNavigate();
  const book = getBook(id);
  if (!book) return null;

  return (
    <div className="modal active">
      <div className="modal-card detail-modal-card">
        <button className="modal-close" onClick={closeModal}>✕</button>
        <div className="detail-cover-banner" style={{ ...s("margin-bottom: 16px"), background: `url('${asset(book.cover)}') center/cover` }}>
          <small>{formatTagString(book.tags || [book.tag], book.tag || "")}</small>
          <strong>{book.title}</strong>
        </div>
        <h2 id={variant === "history" ? "history-detail-title" : "book-detail-title"} style={s("font-family: 'Playfair Display'; margin: 0 0 4px")}>{book.title}</h2>
        <p style={s("color: var(--muted); font-size: 13px; margin: 0 0 14px")}>by {book.author}</p>
        <div className="meta" style={s("margin-bottom: 16px")}>
          <span className="status">{book.statusStr}</span>
          <span>{book.wordStr}</span>
          <span>{book.heartsStr}</span>
        </div>
        <hr style={s("border: 0; border-top: 1px solid var(--line); margin: 16px 0")} />
        <h4 style={s("margin: 0 0 8px; font-size: 14px")}>Synopsis</h4>
        <p style={s("font-size: 14px; line-height: 1.6; color: var(--muted); margin: 0 0 20px")}>{book.synopsis}</p>
        <div style={s("display: flex; justify-content: flex-end")}>
          <button className="btn-primary" style={s("width: auto; padding: 10px 24px")} onClick={() => navigate(`/read/${book.id}/1`)}>
            {variant === "history" ? "Continue" : "Read"}
          </button>
        </div>
      </div>
    </div>
  );
}
