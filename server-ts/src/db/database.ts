import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'weather_platform.db');
const db = new sqlite3.Database(dbPath);

export function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows as T[]);
    });
  });
}

export function run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export async function initDb() {
  await run(`PRAGMA foreign_keys = ON;`);

  // Weather Events Table
  await run(`
    CREATE TABLE IF NOT EXISTS weather_events (
      event_id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      source_type TEXT NOT NULL,
      source_url TEXT,
      author_name TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      ingestion_timestamp TEXT NOT NULL,
      raw_text TEXT NOT NULL,
      normalized_text TEXT NOT NULL,
      event_category TEXT NOT NULL,
      event_subcategory TEXT,
      severity REAL NOT NULL,
      country TEXT NOT NULL DEFAULT 'India',
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      city TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      location_confidence REAL NOT NULL,
      media_type TEXT NOT NULL DEFAULT 'NONE',
      media_url TEXT,
      hashtags TEXT NOT NULL,
      weather_values TEXT NOT NULL,
      verification_status TEXT NOT NULL,
      verification_score REAL NOT NULL,
      trust_score REAL NOT NULL,
      ai_confidence REAL NOT NULL,
      duplicate_score REAL NOT NULL,
      is_duplicate INTEGER NOT NULL DEFAULT 0,
      parent_event_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Spatial & Category Indexes
  await run(`CREATE INDEX IF NOT EXISTS idx_events_state ON weather_events(state);`);
  await run(`CREATE INDEX IF NOT EXISTS idx_events_district ON weather_events(district);`);
  await run(`CREATE INDEX IF NOT EXISTS idx_events_category ON weather_events(event_category);`);
  await run(`CREATE INDEX IF NOT EXISTS idx_events_status ON weather_events(verification_status);`);
  await run(`CREATE INDEX IF NOT EXISTS idx_events_timestamp ON weather_events(timestamp);`);
  await run(`CREATE INDEX IF NOT EXISTS idx_events_coords ON weather_events(latitude, longitude);`);

  // Sources Table
  await run(`
    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      source_type TEXT NOT NULL,
      endpoint_url TEXT NOT NULL,
      polling_interval_sec INTEGER NOT NULL DEFAULT 300,
      is_active INTEGER NOT NULL DEFAULT 1,
      reliability_score REAL NOT NULL DEFAULT 90.0,
      total_reports_fetched INTEGER NOT NULL DEFAULT 0,
      last_polled_at TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Users Table
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'CITIZEN',
      created_at TEXT NOT NULL
    );
  `);

  // Hashtags Config Table
  await run(`
    CREATE TABLE IF NOT EXISTS hashtags (
      id TEXT PRIMARY KEY,
      tag TEXT UNIQUE NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      added_by TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Audit Logs Table
  await run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      ip_address TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);

  // System Alerts Table
  await run(`
    CREATE TABLE IF NOT EXISTS system_alerts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT NOT NULL,
      event_id TEXT,
      state TEXT NOT NULL,
      is_acknowledged INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  console.log('Database schema initialized successfully.');
}

export default db;
