import { useNavigate } from "react-router-dom";
import { asset } from "../../config.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLibrary } from "../../context/LibraryContext.jsx";
import { useModal } from "../../context/ModalContext.jsx";
import { capitalize, s } from "../../utils.js";

function Row({ book, children }) {
  return (
    <div style={s("padding: 12px; background: var(--card); border: 1px solid var(--line); border-radius: 6px; margin-bottom: 8px; display: flex; gap: 12px; align-items: center; color: var(--ink)")}>
      <div style={{ ...s("width: 50px; height: 70px; border-radius: 4px"), background: `url('${asset(book.cover)}') center/cover` }}></div>
      <div style={s("flex: 1; color: var(--ink)")}>
        <h5 style={s("margin: 0 0 4px; font-size: 15px; color: var(--ink)")}>{book.title}</h5>
        <p style={s("margin: 0 0 4px; font-size: 12px; color: var(--muted)")}>{book.synopsis}</p>
        <div style={s("font-size: 11px; font-family: 'DM Mono'; font-weight: 700; color: var(--ink)")}>
          {(book.tags || []).map(capitalize).join("    ")}
        </div>
      </div>
      <div style={s("display: flex; gap: 6px")}>{children}</div>
    </div>
  );
}

export default function MyBooksModal() {
  const { can } = useAuth();
  const { drafts, published, deleteDraft } = useLibrary();
  const { closeModal } = useModal();
  const navigate = useNavigate();

  if (!can("manageWriting")) return null;

  const edit = (type, id) => { closeModal(); navigate(`/studio/${type}/${id}`); };

  return (
    <div className="modal active">
      <div className="modal-card" style={s("max-width: 650px")}>
        <button className="modal-close" onClick={closeModal}>✕</button>
        <h3 style={s("font-family: 'Playfair Display'; margin-top: 0")}>My Books & Drafts</h3>
        <div style={s("display: flex; flex-direction: column; gap: 16px; margin-top: 16px")}>
          <div>
            <h4 style={s("margin: 0 0 8px; font-size: 15px")}>Drafts</h4>
            {!drafts.length && <p style={s("color: var(--muted); font-size: 13px; margin-bottom: 16px")}>No saved drafts.</p>}
            {drafts.map((d) => (
              <Row key={d.id} book={d}>
                <button className="btn-primary" style={s("padding: 4px 10px; font-size: 11px")} onClick={() => edit("draft", d.id)}>Write & Edit</button>
                <button className="btn-primary" style={s("padding: 4px 10px; font-size: 11px; background: #b11f1f")} onClick={() => window.confirm("Are you sure you want to delete this draft?") && deleteDraft(d.id)}>Delete</button>
              </Row>
            ))}

            <h4 style={s("margin: 20px 0 8px; font-size: 15px")}>Published Books</h4>
            {!published.length && <p style={s("color: var(--muted); font-size: 13px")}>No published books yet.</p>}
            {published.map((p) => (
              <Row key={p.id} book={p}>
                <button className="btn-primary" style={s("padding: 4px 10px; font-size: 11px; background: var(--muted)")} onClick={() => edit("published", p.id)}>Write & Edit</button>
              </Row>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
