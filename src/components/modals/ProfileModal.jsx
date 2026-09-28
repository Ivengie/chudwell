import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLibrary } from "../../context/LibraryContext.jsx";
import { useModal } from "../../context/ModalContext.jsx";
import { s } from "../../utils.js";

export default function ProfileModal() {
  const { user, role, isLoggedIn, can, login, logout, setDisplayName, setAvatar } = useAuth();
  const { createDraft } = useLibrary();
  const { openModal, closeModal } = useModal();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return setError("Please enter both your username and password.");
    const err = login(username, password);
    if (err) return setError(err);
    closeModal();
  }

  function changeName() {
    const name = window.prompt("Enter your new display name:", user.displayName);
    if (name && name.trim()) setDisplayName(name.trim());
  }

  function changeAvatar(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setAvatar(evt.target.result);
    reader.readAsDataURL(file);
  }

  function writeNewBook() {
    if (!can("publishBooks")) return alert("Writer access is required to create or publish books.");
    const id = createDraft(user.displayName);
    closeModal();
    navigate(`/studio/draft/${id}`);
  }

  return (
    <div className="modal active">
      <div className="modal-card">
        <button className="modal-close" onClick={closeModal}>✕</button>

        {!isLoggedIn ? (
          <div>
            <div style={s("display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid var(--line)")}>
              <button className="auth-tab" style={s("background: none; border: none; padding: 8px 16px; font-weight: 700; cursor: pointer")}>Login / Register</button>
            </div>
            <form onSubmit={submit}>
              {error && <div style={s("color: #b11f1f; font-size: 12px; margin-bottom: 10px; font-weight: 700")}>{error}</div>}
              <input type="text" className="input-styled" placeholder="Username or Email" required value={username} onChange={(e) => setUsername(e.target.value)} />
              <div style={s("position: relative; margin-top: 10px; margin-bottom: 14px")}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-styled"
                  placeholder="Password"
                  required
                  style={s("padding-right: 42px; margin-bottom: 0")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" id="toggle-password-visibility" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
              <button type="submit" className="btn-primary" style={s("margin-top: 12px")}>Sign In</button>
              <button type="button" className="btn-primary" style={s("margin-top: 10px; background: transparent; color: var(--ink); border: 1px solid var(--line); width: 100%")} onClick={() => { logout(); closeModal(); }}>
                Continue as Guest
              </button>
            </form>
          </div>
        ) : (
          <div>
            <h3 style={s("margin-top: 0; font-family: 'Playfair Display'")}>Welcome, {user.displayName}</h3>
            <div style={s("display: flex; justify-content: center; margin-bottom: 10px")}>
              <span style={s("padding: 4px 10px; border-radius: 999px; background: var(--rose); color: var(--ink); font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase")}>{role}</span>
            </div>
            <div style={s("display: flex; flex-direction: column; align-items: center; gap: 6px; margin: 20px 0")}>
              <div style={s("width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 2px solid var(--rose)")}>
                <img src={user.userAvatar} style={s("width: 100%; height: 100%; object-fit: cover")} alt="Profile Avatar" />
              </div>
              <span style={s("font-size: 13px; font-weight: 700; color: var(--muted)")}>{user.username}</span>
              {can("manageWriting") && (
                <div style={s("display: flex; align-items: center; gap: 6px; margin-top: 4px")}>
                  <button className="btn-primary" style={s("padding: 4px 10px; font-size: 11px; background: #f3d7d1; color: #1c1c1c; border: 1px solid rgba(25, 25, 25, 0.18); font-weight: 700")} onClick={changeName}>Change Display Name</button>
                </div>
              )}
              {can("customizeProfile") && (
                <>
                  <label htmlFor="avatar-upload-input" className="btn-primary" style={s("text-align: center; display: inline-block; width: auto; padding: 6px 14px; font-size: 12px; margin-top: 6px")}>Change Profile Picture</label>
                  <input type="file" id="avatar-upload-input" accept="image/*" style={{ display: "none" }} onChange={changeAvatar} />
                </>
              )}
            </div>
            <hr style={s("border: 0; border-top: 1px solid var(--line); margin: 16px 0")} />
            {can("manageWriting") && (
              <>
                <button className="btn-primary" style={s("margin-bottom: 8px; background: var(--smoke)")} onClick={() => openModal("myBooks")}>📚︎ My Books (Drafts & Published)</button>
                <button className="btn-primary" style={s("margin-bottom: 12px")} onClick={writeNewBook}>✎ Create / Write New Book</button>
              </>
            )}
            <button className="btn-primary" style={s("background: transparent; color: var(--ink); border: 1px solid var(--line)")} onClick={logout}>Log Out</button>
          </div>
        )}
      </div>
    </div>
  );
}
