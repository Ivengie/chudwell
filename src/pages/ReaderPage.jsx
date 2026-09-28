import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLibrary } from "../context/LibraryContext.jsx";
import { useModal } from "../context/ModalContext.jsx";
import { s } from "../utils.js";

export default function ReaderPage() {
  const { bookId, chapter } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn, role } = useAuth();
  const { getBook, readerData, toggleLike, addComment, deleteComment } = useLibrary();
  const { openModal } = useModal();

  const book = getBook(bookId);
  const readerBook = readerData[bookId];
  const chapters = readerBook?.chapters || [];
  const index = Math.min(Math.max((parseInt(chapter, 10) || 1) - 1, 0), Math.max(chapters.length - 1, 0));
  const ch = chapters[index];
  const canComment = isLoggedIn && role !== "guest";

  const [comment, setComment] = useState("");
  const [playing, setPlaying] = useState(false);
  const [toast, setToast] = useState(false);
  const audioRef = useRef(null);
  const toastTimer = useRef(null);

  // Unknown book or no chapters: go home (same message the original showed).
  useEffect(() => {
    if (!chapters.length) {
      if (readerBook) alert("This book doesn't have any published chapters yet.");
      navigate("/", { replace: true });
    }
  }, [chapters.length, readerBook, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [bookId, index]);

  // One looping <audio> for the whole reader; stop it when leaving.
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.45;
    audio.addEventListener("play", () => setPlaying(true));
    audio.addEventListener("pause", () => setPlaying(false));
    audioRef.current = audio;
    return () => {
      audio.pause();
      clearTimeout(toastTimer.current);
    };
  }, []);

  // Start (or stop) the music whenever the chapter changes.
  const musicUrl = ch?.musicUrl;
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!musicUrl) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }
    if (audio.getAttribute("src") !== musicUrl) {
      audio.src = musicUrl;
      audio.load();
    }
    audio.play().catch(() => {}); // browsers may block autoplay until the user clicks
  }, [musicUrl, bookId, index]);

  function toggleMusic() {
    const audio = audioRef.current;
    if (!musicUrl) {
      setToast(true);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(false), 1800);
      return;
    }
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }

  if (!ch) return null;

  const goTo = (n) => navigate(`/read/${bookId}/${n}`, { replace: true });
  const hasPrev = index > 0;
  const hasNext = index < chapters.length - 1;
  const indicator = `Chapter ${index + 1} of ${chapters.length}`;
  const paragraphs = (ch.text || "").split(/\n\s*\n/).map((p) => p.trim());

  function submitComment(e) {
    e.preventDefault();
    const text = comment.trim();
    if (!text) return;
    addComment(bookId, index, user.displayName || "You", text);
    setComment("");
  }

  const PrevBtn = hasPrev && <button type="button" className="btn-primary reader-nav-btn" onClick={() => goTo(index)}>← Previous</button>;
  const NextBtn = hasNext && <button type="button" className="btn-primary reader-nav-btn" onClick={() => goTo(index + 2)}>Next Chapter →</button>;

  return (
    <section className="page-view active">
      <div className="reader-page-shell">
        <div className="reader-page-header">
          <div>
            <div className="reader-book-tag">{(book?.tag || "").toUpperCase()}</div>
            <h3 style={s("margin: 8px 0 2px; font-family: 'Playfair Display'")}>{readerBook.title}</h3>
            <p style={s("margin: 0; color: var(--muted); font-size: 13px")}>by {book?.author || "Unknown author"}</p>
          </div>
          <Link to="/" className="btn-primary" style={s("width: auto; padding: 8px 14px; text-decoration: none")}>Back to Library</Link>
        </div>

        <div className="reader-toolbar">
          <div className="reader-toolbar-group">
            <select className="reader-select" value={index} onChange={(e) => goTo(Number(e.target.value) + 1)}>
              {chapters.map((c, i) => <option key={i} value={i}>{c.title}</option>)}
            </select>
          </div>
          <div className="reader-toolbar-group reader-toolbar-group-right">
            <button type="button" className="icon-btn reader-music-toggle" aria-label="Toggle music" onClick={toggleMusic}
              title={!musicUrl ? "No music for this chapter" : playing ? "Pause chapter music" : "Play chapter music"}>
              <span className="reader-music-icon">{musicUrl && playing ? "❚❚" : "▶"}</span>
            </button>
            {PrevBtn}
            {NextBtn}
          </div>
        </div>

        <div className={"reader-music-toast" + (toast ? " visible" : "")} aria-live="polite">No music playing for this chapter.</div>

        <div className="reader-layout">
          <div className="reader-main">
            <div className="reader-chapter-nav"><span id="reader-chapter-indicator">{indicator}</span></div>

            <div className="reader-chapter-box">
              <h4>{ch.title}</h4>
              <div className="reader-chapter-text">
                {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>

            <div className="reader-interaction-row">
              <button type="button" className={"reader-like-btn" + (ch.likedByUser ? " active" : "")} onClick={() => toggleLike(bookId, index)}>
                {ch.likedByUser ? "♥ Liked" : "♡ Like"}
              </button>
              <span>{ch.likes || 0} likes</span>
            </div>

            <div className="reader-comments-box">
              <h4>Comments</h4>
              <ul className="reader-comments-list">
                {(ch.comments || []).map((c, i) => {
                  const own = canComment && (c.user === user.displayName || c.user === "You");
                  return (
                    <li key={i}>
                      <div className="reader-comment-entry">
                        <div><strong>{c.user}</strong> <span>{c.text}</span></div>
                        {own && <button type="button" className="reader-comment-delete" onClick={() => deleteComment(bookId, index, i)}>Delete</button>}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {canComment ? (
                <form onSubmit={submitComment} className="reader-comment-form" style={{ display: "flex" }}>
                  <textarea rows={3} placeholder="Leave a comment on this chapter..." required value={comment} onChange={(e) => setComment(e.target.value)} />
                  <button type="submit" className="btn-primary">Post Comment</button>
                </form>
              ) : (
                <div style={s("padding: 12px; background: var(--chiffon); border: 1px solid var(--line); border-radius: 6px; font-size: 13px; color: var(--muted); text-align: center")}>
                  Please{" "}
                  <a href="#" onClick={(e) => { e.preventDefault(); openModal("profile"); }} style={s("color: var(--button); font-weight: bold; text-decoration: underline")}>log in or register</a>{" "}
                  to leave comments.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="reader-floating-controls">
          {PrevBtn}
          <span id="reader-floating-indicator">{indicator}</span>
          {NextBtn}
        </div>
      </div>
    </section>
  );
}
