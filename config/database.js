const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'portfolio.db');

let db = null;

/**
 * Initialize the SQLite database using sql.js (pure JavaScript, no native deps).
 * Loads existing database file if present, otherwise creates a new one.
 * Creates tables if they don't exist.
 */
async function initDatabase() {
  const SQL = await initSqlJs();

  // Load existing database file or create new
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      published_at TEXT DEFAULT (datetime('now')),
      is_hidden INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      author TEXT DEFAULT 'Anonymous Diver',
      content TEXT NOT NULL,
      timestamp TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_ip TEXT,
      message TEXT NOT NULL,
      timestamp TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS admin_credentials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);

  // Save to disk
  saveDatabase();

  console.log('[DB] SQLite database initialized at', DB_PATH);
  return db;
}

/**
 * Persist the in-memory database to disk.
 * Must be called after any write operation.
 */
function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

/**
 * Get the active database instance.
 * @returns {Database} The sql.js database instance
 */
function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Helper: Run a SELECT query and return all rows as an array of objects.
 * @param {string} sql - The SQL query
 * @param {Array} params - Bind parameters
 * @returns {Array<Object>} Array of row objects
 */
function queryAll(sql, params = []) {
  const d = getDb();
  const stmt = d.prepare(sql);
  stmt.bind(params);

  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

/**
 * Helper: Run a SELECT query and return the first row as an object, or null.
 * @param {string} sql - The SQL query
 * @param {Array} params - Bind parameters
 * @returns {Object|null} Row object or null
 */
function queryOne(sql, params = []) {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * Helper: Run an INSERT/UPDATE/DELETE statement.
 * Automatically saves to disk after write operations.
 * @param {string} sql - The SQL statement
 * @param {Array} params - Bind parameters
 * @returns {Object} Result info with lastInsertRowid
 */
function runStatement(sql, params = []) {
  const d = getDb();
  d.run(sql, params);

  // Get last insert ID if this was an INSERT
  const lastId = queryOne('SELECT last_insert_rowid() as id');

  // Persist to disk
  saveDatabase();

  return { lastInsertRowid: lastId ? lastId.id : 0 };
}

module.exports = { initDatabase, getDb, saveDatabase, queryAll, queryOne, runStatement };
