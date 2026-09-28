import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLibrary } from "../../context/LibraryContext.jsx";
import { useModal } from "../../context/ModalContext.jsx";
import { s } from "../../utils.js";

export default function CreateListModal() {
  const { can } = useAuth();
  const { createList } = useLibrary();
  const { closeModal } = useModal();
  const [name, setName] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!can("createReadingLists")) return alert("You must be a registered Reader or higher to create reading lists.");
    if (name.trim()) {
      createList(name.trim());
      closeModal();
    }
  }

  return (
    <div className="modal active">
      <div className="modal-card">
        <button className="modal-close" onClick={closeModal}>✕</button>
        <h3 style={s("margin-top: 0; font-family: 'Playfair Display'")}>Create Reading List</h3>
        <form onSubmit={submit}>
          <input type="text" className="input-styled" placeholder="List Name (e.g. Cozy Favorites)" required value={name} onChange={(e) => setName(e.target.value)} />
          <button type="submit" className="btn-primary">Create List</button>
        </form>
      </div>
    </div>
  );
}
