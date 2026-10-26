import { asset } from "../../config.js";
import { useLibrary } from "../../context/LibraryContext.jsx";
import { useModal } from "../../context/ModalContext.jsx";
import { s } from "../../utils.js";

export default function ReadingListModal({ index }) {
  const { lists, getBook, removeFromList, renameList } = useLibrary();
  const { openModal, closeModal } = useModal();
  const list = lists[index];
  if (!list) return null;

  function rename() {
    const name = window.prompt("Enter new name for this reading list:", list.name);
    if (name && name.trim()) renameList(index, name.trim());
  }

  const books = list.books.map(getBook).filter(Boolean);

  return (
    <div className="modal active">
      <div className="modal-card" style={s("max-width: 650px")}>
        <button className="modal-close" onClick={closeModal}>✕</button>
        <div style={s("display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px")}>
          <h3 style={s("font-family: 'Playfair Display'; margin: 0")}>{list.name}</h3>
          <button className="btn-primary" style={s("width: auto; padding: 6px 12px; font-size: 11px")} onClick={rename}>Edit Name</button>
        </div>
        <div style={s("display: flex; flex-direction: column; gap: 12px; margin-top: 16px")}>
          {!books.length && (
            <p style={s("color: var(--muted); font-size: 14px; text-align: center; padding: 20px")}>
              You don't have a book here yet, explore more to see books here
            </p>
          )}
          {books.map((book) => (
            <div key={book.id} style={s("display: flex; gap: 14px; align-items: center; justify-content: space-between; padding: 10px; background: var(--card); border: 1px solid var(--line); border-radius: 6px; color: var(--ink)")}>
              <div style={s("display: flex; gap: 12px; align-items: center; cursor: pointer; flex: 1")} onClick={() => openModal("book", { id: book.id })}>
                <div style={{ ...s("width: 45px; height: 60px; border-radius: 4px"), background: `url('${asset(book.cover)}') center/cover` }}></div>
                <div>
                  <h4 style={s("margin: 0 0 4px; font-size: 15px; color: var(--ink)")}>{book.title}</h4>
                  <p style={s("margin: 0; font-size: 12px; color: var(--muted)")}>by {book.author} · {book.wordStr}</p>
                </div>
              </div>
              <button className="btn-primary" style={s("width: auto; padding: 4px 8px; font-size: 11px; background: var(--button); color: #fff")} onClick={() => removeFromList(index, book.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
