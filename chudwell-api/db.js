import Database from "better-sqlite3";

const db = new Database("chudwell.db");
db.pragma("foreign_keys = ON");

// tables from CHUDWELL
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    Id        INTEGER PRIMARY KEY AUTOINCREMENT,
    Username  TEXT NOT NULL UNIQUE,
    Email     TEXT NOT NULL,
    Password  TEXT NOT NULL,
    Name      TEXT NOT NULL DEFAULT 'Reader'
  );
  CREATE TABLE IF NOT EXISTS books (
    Id         INTEGER PRIMARY KEY AUTOINCREMENT,
    Author_id  INTEGER NOT NULL REFERENCES users(Id),
    Title      TEXT NOT NULL,
    Synopsis   TEXT NOT NULL,
    Status     TEXT NOT NULL,
    Likes      INTEGER NOT NULL DEFAULT 0,
    Words      INTEGER NOT NULL DEFAULT 0,
    Tags       TEXT
  );
  CREATE TABLE IF NOT EXISTS notifications (
    Id         INTEGER PRIMARY KEY AUTOINCREMENT,
    Author_id  INTEGER NOT NULL REFERENCES users(Id),   -- the user who receives it
    Book_id    INTEGER REFERENCES books(Id),
    Content    TEXT NOT NULL
  );
`);

const duplicateEmailCount = db.prepare(`
  SELECT COUNT(*) AS count
  FROM (
    SELECT 1
    FROM users
    GROUP BY lower(trim(Email))
    HAVING COUNT(*) > 1
  )
`).get().count;

if (duplicateEmailCount > 0) {
  throw new Error(
    `Cannot enforce email uniqueness: ${duplicateEmailCount} duplicate email group(s) exist. Resolve them in chudwell.db before starting the API.`,
  );
}

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique
  ON users (lower(trim(Email)))
`);

export default db;
