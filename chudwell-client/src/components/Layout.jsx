import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useModal } from "../context/ModalContext.jsx";
import { STORAGE } from "../config.js";
import ModalRoot from "./modals/ModalRoot.jsx";

export default function Layout() {
  const { user, role, isLoggedIn } = useAuth();
  const { openModal, closeModal } = useModal();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [theme, setTheme] = useState(() => (localStorage.getItem(STORAGE.theme) === "dark" ? "dark" : "light"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notifSeen, setNotifSeen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE.theme, theme);
  }, [theme]);

  // Popups and the drawer never survive a page change.
  useEffect(() => {
    closeModal();
    setDrawerOpen(false);
  }, [pathname, closeModal]);

  function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search?${new URLSearchParams({ mode: "global", q })}`);
  }

  function openNotifications() {
    if (!isLoggedIn || role === "guest") return alert("Guests cannot access notifications.");
    setNotifSeen(true);
    openModal("notifications");
  }

  const menu = [
    { label: "Home", icon: "🏠︎", to: "/" },
    { label: "Advanced Search", icon: "✎", to: "/advanced-search" },
    { label: "Browse", icon: "🔍︎", to: "/browse" },
    ...(isLoggedIn ? [{ label: "Shelves", icon: "📚︎", to: "/shelves" }] : []),
  ];
  const drawerTitle = !isLoggedIn ? "Dashboard" : role === "writer" ? "Writer Dashboard" : "Reader Dashboard";

  return (
    <>
      <header className="sticky-top">
        <div className="wrap top-bar">
          <div className="brand" onClick={() => navigate("/")}>chud<i>well</i></div>

          <form className="header-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search stories by title or author…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit">🔍︎</button>
          </form>

          <div className="top-right-actions">
            <button className="icon-btn theme-btn" aria-label="Change theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>◐</button>

            {isLoggedIn && (
              <div className="notif-container">
                <button className="icon-btn" title="Notifications" onClick={openNotifications}>
                  <svg className="bell-svg" viewBox="0 0 24 24">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span className="notif-badge" style={notifSeen ? { display: "none" } : undefined}></span>
                </button>
              </div>
            )}

            <button className="profile-avatar-btn" title="Profile Menu" onClick={() => openModal("profile")}>
              <img src={user.userAvatar} alt="Profile Avatar" />
            </button>

            <button className="icon-btn menu-btn" title="Open Menu" onClick={() => setDrawerOpen(true)}>☰</button>
          </div>
        </div>
      </header>

      <div className={"drawer-overlay" + (drawerOpen ? " open" : "")} onClick={() => setDrawerOpen(false)}></div>
      <aside className={"drawer" + (drawerOpen ? " open" : "")}>
        <div className="drawer-header">
          <h3>{drawerTitle}</h3>
          <button className="icon-btn" onClick={() => setDrawerOpen(false)}>✕</button>
        </div>
        <div className="drawer-menu">
          {menu.map((item) => (
            <button key={item.to} className="drawer-item" onClick={() => { setDrawerOpen(false); navigate(item.to); }}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </div>
      </aside>

      <main className={pathname.startsWith("/read/") ? undefined : "wrap"}>
        <Outlet />
      </main>

      <ModalRoot />
    </>
  );
}
