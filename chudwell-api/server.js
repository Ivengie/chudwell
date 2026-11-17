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

const sign = (user) =>
  jwt.sign(
    { id: Number(user.id), username: user.username, role: user.role },
    SECRET,
    { expiresIn: "7d" },
  );
const publicUser = (user) => ({
  id: Number(user.id),
  username: user.username,
  email: user.email,
  name: user.name,
  role: user.role,
});
const publicBook = (book) => ({
  ...book,
  id: Number(book.id),
  author_id: Number(book.author_id),
  likes: Number(book.likes),
  words: Number(book.words),
});
const USER_SQL = "SELECT Id AS id, Username AS username, Email AS email, Password AS password, Name AS name, Role AS role FROM users";
const BOOK_SQL = "SELECT Id AS id, Author_id AS author_id, Title AS title, Synopsis AS synopsis, Status AS status, Likes AS likes, Words AS words, Tags AS tags FROM books";

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function requireAuth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Please log in." });
  }
}

function requireRole(role) {
  return asyncRoute(async (req, res, next) => {
    const { rows } = await db.execute({
      sql: "SELECT Role AS role FROM users WHERE Id = ?",
      args: [req.user.id],
    });
    const account = rows[0];
    if (!account) return res.status(401).json({ error: "Please log in." });
    if (account.role !== role) {
      return res.status(403).json({ error: "You do not have permission to do that." });
    }

    req.user.role = account.role;
    next();
  });
}

app.get("/", (_req, res) => {
  res.json({ service: "Chudwell API", status: "ok", health: "/api/health" });
});

app.get("/api/health", asyncRoute(async (_req, res) => {
  await db.execute("SELECT 1");
  res.json({ status: "ok", database: "connected" });
}));

// ---------- auth routes ----------
app.post("/api/auth/register", asyncRoute(async (req, res) => {
  const { username, email, password, name } = req.body ?? {};
  if (
    typeof username !== "string" ||
    !username.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string"
  ) {
    return res.status(400).json({ error: "Username, email and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const transaction = await db.transaction("write");
  try {
    const result = await transaction.execute({
      sql: "INSERT INTO users (Username, Email, Password, Name) VALUES (?, ?, ?, ?)",
      args: [
        username.trim(),
        normalizedEmail,
        await bcrypt.hash(password, 10),
        typeof name === "string" && name.trim() ? name.trim() : "Reader",
      ],
    });
    const userId = result.lastInsertRowid;
    await transaction.execute({
      sql: "INSERT INTO notifications (Author_id, Content) VALUES (?, ?)",
      args: [userId, "Welcome to Chudwell!"],
    });
    const { rows } = await transaction.execute({
      sql: USER_SQL + " WHERE Id = ?",
      args: [userId],
    });
    const user = rows[0];
    await transaction.commit();
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  } catch (error) {
    await transaction.rollback();
    if (error instanceof Error && /UNIQUE constraint failed/i.test(error.message)) {
      return res.status(409).json({ error: "Username or email is already taken." });
    }
    throw error;
  }
}));

app.post("/api/auth/login", asyncRoute(async (req, res) => {
  const { identifier, password } = req.body ?? {};
  const loginIdentifier = typeof identifier === "string" ? identifier.trim() : "";
  const { rows } = await db.execute({
    sql: USER_SQL + " WHERE Username = ? OR lower(trim(Email)) = ?",
    args: [loginIdentifier, loginIdentifier.toLowerCase()],
  });
  const user = rows[0];
  if (!user || typeof password !== "string" || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid username or password." });
  }
  res.json({ token: sign(user), user: publicUser(user) });
}));

app.get("/api/me", requireAuth, asyncRoute(async (req, res) => {
  const { rows } = await db.execute({
    sql: USER_SQL + " WHERE Id = ?",
    args: [req.user.id],
  });
  const user = rows[0];
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json(publicUser(user));
}));

// ---------- books ----------
app.get("/api/books", asyncRoute(async (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q.toLowerCase() : "";
  const { rows } = await db.execute({
    sql: BOOK_SQL + " WHERE lower(Title) LIKE ? ORDER BY Likes DESC",
    args: [`%${query}%`],
  });
  res.json(rows.map(publicBook));
}));

app.get("/api/books/:id", asyncRoute(async (req, res) => {
  const { rows } = await db.execute({
    sql: BOOK_SQL + " WHERE Id = ?",
    args: [req.params.id],
  });
  const book = rows[0];
  book ? res.json(publicBook(book)) : res.status(404).json({ error: "Book not found." });
}));

app.post("/api/books", requireAuth, requireRole("writer"), asyncRoute(async (req, res) => {
  const { title, synopsis = "", status = "ongoing", tags = "" } = req.body ?? {};
  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "Title is required." });
  }
  const result = await db.execute({
    sql: "INSERT INTO books (Author_id, Title, Synopsis, Status, Tags) VALUES (?, ?, ?, ?, ?)",
    args: [req.user.id, title.trim(), synopsis, status, tags],
  });
  const { rows } = await db.execute({
    sql: BOOK_SQL + " WHERE Id = ?",
    args: [result.lastInsertRowid],
  });
  res.status(201).json(publicBook(rows[0]));
}));

app.put("/api/books/:id", requireAuth, requireRole("writer"), asyncRoute(async (req, res) => {
  const { rows: books } = await db.execute({
    sql: "SELECT Author_id FROM books WHERE Id = ?",
    args: [req.params.id],
  });
  const book = books[0];
  if (!book) return res.status(404).json({ error: "Book not found." });
  if (Number(book.Author_id) !== Number(req.user.id)) {
    return res.status(403).json({ error: "You can only edit your own books." });
  }
  const { title, synopsis, status, tags } = req.body ?? {};
  await db.execute({
    sql: "UPDATE books SET Title = COALESCE(?, Title), Synopsis = COALESCE(?, Synopsis), Status = COALESCE(?, Status), Tags = COALESCE(?, Tags) WHERE Id = ?",
    args: [title ?? null, synopsis ?? null, status ?? null, tags ?? null, req.params.id],
  });
  const { rows } = await db.execute({
    sql: BOOK_SQL + " WHERE Id = ?",
    args: [req.params.id],
  });
  res.json(publicBook(rows[0]));
}));

// ---------- notifications ----------
app.get("/api/notifications", requireAuth, asyncRoute(async (req, res) => {
  const { rows } = await db.execute({
    sql: "SELECT Id AS id, Book_id AS book_id, Content AS content FROM notifications WHERE Author_id = ? ORDER BY Id DESC",
    args: [req.user.id],
  });
  res.json(rows.map((notification) => ({
    ...notification,
    id: Number(notification.id),
    book_id: notification.book_id === null ? null : Number(notification.book_id),
  })));
}));

app.use((error, _req, res, _next) => {
  console.error("API request failed:", error);
  res.status(500).json({ error: "An unexpected server error occurred." });
});

app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
