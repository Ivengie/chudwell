import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error("Set JWT_SECRET in .env");

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

// ---------- auth helpers ----------
const sign = (user) => jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: "7d" });

// Middleware: requires "Authorization: Bearer <token>"
function requireAuth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Please log in." });
  }
}

const publicUser = (u) => ({ id: u.id, username: u.username, email: u.email, name: u.name });
const USER_SQL = "SELECT Id AS id, Username AS username, Email AS email, Password AS password, Name AS name FROM users";
const BOOK_SQL = "SELECT Id AS id, Author_id AS author_id, Title AS title, Synopsis AS synopsis, Status AS status, Likes AS likes, Words AS words, Tags AS tags FROM books";

// ---------- auth routes ----------
app.post("/api/auth/register", (req, res) => {
  const { username, email, password, name } = req.body;
  if (!username?.trim() || !email?.trim() || !password) return res.status(400).json({ error: "Username, email and password are required." });
  if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });
  const normalizedEmail = email.trim().toLowerCase();
  if (db.prepare("SELECT 1 FROM users WHERE Username = ? OR lower(trim(Email)) = ?").get(username.trim(), normalizedEmail))
    return res.status(409).json({ error: "Username or email is already taken." });

  const hash = bcrypt.hashSync(password, 10); // never store the real password
  let userId;
  try {
    userId = db.transaction(() => {
      const info = db.prepare("INSERT INTO users (Username, Email, Password, Name) VALUES (?, ?, ?, ?)")
        .run(username.trim(), normalizedEmail, hash, name?.trim() || "Reader");
      db.prepare("INSERT INTO notifications (Author_id, Content) VALUES (?, ?)").run(info.lastInsertRowid, "Welcome to Chudwell!");
      return info.lastInsertRowid;
    })();
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Username or email is already taken." });
    }
    throw error;
  }

  const user = db.prepare(USER_SQL + " WHERE Id = ?").get(userId);
  res.status(201).json({ token: sign(user), user: publicUser(user) });
});

app.post("/api/auth/login", (req, res) => {
  const { identifier, password } = req.body; // username or email
  const loginIdentifier = typeof identifier === "string" ? identifier.trim() : "";
  const user = db.prepare(USER_SQL + " WHERE Username = ? OR lower(trim(Email)) = ?")
    .get(loginIdentifier, loginIdentifier.toLowerCase());
  if (!user || !bcrypt.compareSync(password ?? "", user.password))
    return res.status(401).json({ error: "Invalid username or password." });
  res.json({ token: sign(user), user: publicUser(user) });
});

app.get("/api/me", requireAuth, (req, res) => {
  const user = db.prepare(USER_SQL + " WHERE Id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json(publicUser(user));
});

// ---------- books ----------
app.get("/api/books", (req, res) => {
  const q = `%${(req.query.q || "").toLowerCase()}%`;
  const rows = db.prepare(BOOK_SQL + " WHERE lower(Title) LIKE ? ORDER BY Likes DESC").all(q);
  res.json(rows);
});

app.get("/api/books/:id", (req, res) => {
  const book = db.prepare(BOOK_SQL + " WHERE Id = ?").get(req.params.id);
  book ? res.json(book) : res.status(404).json({ error: "Book not found." });
});

app.post("/api/books", requireAuth, (req, res) => {
  const { title, synopsis = "", status = "ongoing", tags = "" } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: "Title is required." });
  const info = db.prepare("INSERT INTO books (Author_id, Title, Synopsis, Status, Tags) VALUES (?, ?, ?, ?, ?)")
    .run(req.user.id, title.trim(), synopsis, status, tags);
  res.status(201).json(db.prepare(BOOK_SQL + " WHERE Id = ?").get(info.lastInsertRowid));
});

app.put("/api/books/:id", requireAuth, (req, res) => {
  const book = db.prepare("SELECT Author_id FROM books WHERE Id = ?").get(req.params.id);
  if (!book) return res.status(404).json({ error: "Book not found." });
  if (book.Author_id !== req.user.id) return res.status(403).json({ error: "You can only edit your own books." });
  const { title, synopsis, status, tags } = req.body;
  db.prepare("UPDATE books SET Title = COALESCE(?, Title), Synopsis = COALESCE(?, Synopsis), Status = COALESCE(?, Status), Tags = COALESCE(?, Tags) WHERE Id = ?")
    .run(title ?? null, synopsis ?? null, status ?? null, tags ?? null, req.params.id);
  res.json(db.prepare(BOOK_SQL + " WHERE Id = ?").get(req.params.id));
});

// ---------- notifications ----------
app.get("/api/notifications", requireAuth, (req, res) => {
  res.json(db.prepare("SELECT Id AS id, Book_id AS book_id, Content AS content FROM notifications WHERE Author_id = ? ORDER BY Id DESC").all(req.user.id));
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
