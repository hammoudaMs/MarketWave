import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { config } from './config.js';

let db;

export function getDb() {
  if (!db) {
    const dir = path.dirname(config.dbPath);
    fs.mkdirSync(dir, { recursive: true });
    db = new Database(config.dbPath);
    db.pragma('journal_mode = WAL');
    initSchema(db);
  }
  return db;
}

function initSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      source TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT,
      summary TEXT,
      amount_min REAL,
      amount_max REAL,
      currency TEXT DEFAULT 'TND',
      deadline TEXT,
      status TEXT DEFAULT 'open',
      content_hash TEXT NOT NULL,
      first_seen_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS run_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ran_at TEXT NOT NULL,
      total_found INTEGER NOT NULL,
      new_count INTEGER NOT NULL,
      updated_count INTEGER NOT NULL,
      duration_ms INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export function getSetting(key) {
  const row = getDb().prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row?.value ?? null;
}

export function setSetting(key, value) {
  getDb()
    .prepare(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
    )
    .run(key, value);
}

export function getOpportunity(id) {
  return getDb().prepare('SELECT * FROM opportunities WHERE id = ?').get(id);
}

export function upsertOpportunity(record) {
  const existing = getOpportunity(record.id);
  const now = new Date().toISOString();

  if (!existing) {
    getDb()
      .prepare(
        `INSERT INTO opportunities (
          id, title, url, source, category, type, summary,
          amount_min, amount_max, currency, deadline, status,
          content_hash, first_seen_at, last_seen_at
        ) VALUES (
          @id, @title, @url, @source, @category, @type, @summary,
          @amount_min, @amount_max, @currency, @deadline, @status,
          @content_hash, @first_seen_at, @last_seen_at
        )`
      )
      .run({
        ...record,
        first_seen_at: now,
        last_seen_at: now,
      });
    return { change: 'new', record };
  }

  if (existing.content_hash !== record.content_hash) {
    getDb()
      .prepare(
        `UPDATE opportunities SET
          title = @title, url = @url, source = @source, category = @category,
          type = @type, summary = @summary, amount_min = @amount_min,
          amount_max = @amount_max, currency = @currency, deadline = @deadline,
          status = @status, content_hash = @content_hash, last_seen_at = @last_seen_at
        WHERE id = @id`
      )
      .run({ ...record, last_seen_at: now });
    return { change: 'updated', record, previous: existing };
  }

  getDb()
    .prepare('UPDATE opportunities SET last_seen_at = ? WHERE id = ?')
    .run(now, record.id);
  return { change: 'unchanged', record };
}

export function logRun({ totalFound, newCount, updatedCount, durationMs }) {
  getDb()
    .prepare(
      'INSERT INTO run_log (ran_at, total_found, new_count, updated_count, duration_ms) VALUES (?, ?, ?, ?, ?)'
    )
    .run(new Date().toISOString(), totalFound, newCount, updatedCount, durationMs);
}

export function getLastRun() {
  return getDb()
    .prepare('SELECT * FROM run_log ORDER BY id DESC LIMIT 1')
    .get();
}

export function getRunCount() {
  return getDb().prepare('SELECT COUNT(*) as count FROM run_log').get().count;
}
