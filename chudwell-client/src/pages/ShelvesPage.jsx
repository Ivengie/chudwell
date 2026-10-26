import { useState } from "react";
import { asset, HISTORY } from "../config.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLibrary } from "../context/LibraryContext.jsx";
import { useModal } from "../context/ModalContext.jsx";
import { s } from "../utils.js";

export default function ShelvesPage() {
  const { can } = useAuth();
  const { getBook, lists } = useLibrary();
  const { openModal } = useModal();
  const [tab, setTab] = useState("history");

  return (
    <section className="page-view active">
      <div className="shelves-container">
        <div className="shelves-header-title">Shelves</div>
        <div className="shelves-tabs">
          <button className={"shelves-tab-btn" + (tab === "history" ? " active" : "")} onClick={() => setTab("history")}>History</button>
          <button className={"shelves-tab-btn" + (tab === "lists" ? " active" : "")} onClick={() => setTab("lists")}>Reading List</button>
        </div>

        {tab === "history" ? (
          <div>
            <div style={s("display: flex; justify-content: space-between; margin-bottom: 20px")}>
              <h3 style={s("margin: 0; font-size: 16px")}>All Stories</h3>
              <span style={s("font-size: 12px; color: var(--muted)")}>🔒︎ Private</span>
            </div>
            <div className="history-grid">
              {HISTORY.map(({ id, progress }) => {
                const book = getBook(id);
                if (!book) return null;
                return (
                  <div key={id} className="history-item" onClick={() => openModal("book", { id, variant: "history" })}>
                    <div className="history-cover-wrap">
                      <div style={{ ...s("width: 100%; height: 100%; padding: 10px"), background: `url('${asset(book.cover)}') center/cover` }}></div>
                      <div className="reading-progress-bar"><div className="reading-progress-fill" style={{ width: `${progress}%` }}></div></div>
                    </div>
                    <div className="history-book-title">{book.title}</div>
                    <div className="history-book-author">by {book.author}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <button className="create-list-btn" onClick={() => (can("createReadingLists") ? openModal("createList") : alert("You must be a registered Reader or higher to create reading lists."))}>
              <span>+</span> Create Reading List
            </button>
            <div>
              {lists.map((list, index) => (
                <div key={index} className="reading-list-card" onClick={() => openModal("readingList", { index })}>
                  <div className="list-thumbnail">{list.icon}</div>
                  <div className="list-info">
                    <h4>{list.name}</h4>
                    <p>{list.books.length} stories</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
