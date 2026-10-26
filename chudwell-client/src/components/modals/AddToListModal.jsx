import { useState } from "react";
import { useLibrary } from "../../context/LibraryContext.jsx";
import { useModal } from "../../context/ModalContext.jsx";
import { s } from "../../utils.js";

export default function AddToListModal({ bookId }) {
  const { lists, setBookLists } = useLibrary();
  const { closeModal } = useModal();
  const [checked, setChecked] = useState(() => lists.flatMap((l, i) => (l.books.includes(bookId) ? [i] : [])));

  const toggle = (i) => setChecked((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]));

  function confirm() {
    setBookLists(bookId, checked);
    closeModal();
    alert("Reading lists updated successfully!");
  }

  return (
    <div className="modal active">
      <div className="modal-card" style={s("max-width: 400px")}>
        <button className="modal-close" onClick={closeModal}>✕</button>
        <h3 style={s("font-family: 'Playfair Display'; margin-top: 0")}>Add to Reading List</h3>
        <p style={s("font-size: 13px; color: var(--muted); margin-bottom: 16px")}>Select a reading list to add this book to:</p>
        <div style={s("display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px")}>
          {lists.map((list, i) => (
            <label key={i} className="radio-label">
              <input type="checkbox" checked={checked.includes(i)} onChange={() => toggle(i)} /> {list.name}
            </label>
          ))}
        </div>
        <button className="btn-primary" onClick={confirm}>Confirm</button>
      </div>
    </div>
  );
}
