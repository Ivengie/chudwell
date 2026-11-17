import { createClient } from "@libsql/client";

const isProduction = process.env.NODE_ENV === "production";
if (isProduction && (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN)) {
  throw new Error("Production requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN; refusing to use an ephemeral local database.");
}

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:./chudwell.db",
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

async function initializeDatabase() {
  await db.execute("PRAGMA foreign_keys = ON");
  await db.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const { rows: migrationRows } = await db.execute("SELECT version FROM schema_migrations");
  const appliedVersions = new Set(migrationRows.map((row) => Number(row.version)));

  if (!appliedVersions.has(1)) {
    await db.batch([
      `CREATE TABLE IF NOT EXISTS users (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Username TEXT NOT NULL UNIQUE,
        Email TEXT NOT NULL,
        Password TEXT NOT NULL,
        Name TEXT NOT NULL DEFAULT 'Reader'
      )`,
      `CREATE TABLE IF NOT EXISTS books (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Author_id INTEGER NOT NULL REFERENCES users(Id),
        Title TEXT NOT NULL,
        Synopsis TEXT NOT NULL,
        Status TEXT NOT NULL,
        Likes INTEGER NOT NULL DEFAULT 0,
        Words INTEGER NOT NULL DEFAULT 0,
        Tags TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS notifications (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Author_id INTEGER NOT NULL REFERENCES users(Id),
        Book_id INTEGER REFERENCES books(Id),
        Content TEXT NOT NULL
      )`,
    ], "write");

    const { rows: duplicateRows } = await db.execute(`
      SELECT COUNT(*) AS count
      FROM (
        SELECT 1
        FROM users
        GROUP BY lower(trim(Email))
        HAVING COUNT(*) > 1
      )
    `);
    const duplicateEmailCount = Number(duplicateRows[0].count);
    if (duplicateEmailCount > 0) {
      throw new Error(
        `Cannot enforce email uniqueness: ${duplicateEmailCount} duplicate email group(s) exist. Resolve them before starting the API.`,
      );
    }

    await db.batch([
      "CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (lower(trim(Email)))",
      "INSERT OR IGNORE INTO schema_migrations (version) VALUES (1)",
    ], "write");
  }

  if (!appliedVersions.has(3)) {
    const { rows: bookColumns } = await db.execute("PRAGMA table_info(books)");
    if (!bookColumns.some((column) => column.name === "Cover_url")) {
      try {
        await db.execute("ALTER TABLE books ADD COLUMN Cover_url TEXT");
      } catch (error) {
        if (!(error instanceof Error) || !/duplicate column name: Cover_url/i.test(error.message)) {
          throw error;
        }
      }
    }
    await db.execute("INSERT OR IGNORE INTO schema_migrations (version) VALUES (3)");
  }
}

await initializeDatabase();

export default db;
