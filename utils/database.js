const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/dreamsync.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('✅ 已连接到 DreamSync 数据库');
  }
});

db.run('PRAGMA foreign_keys = ON');

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 用户表
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          avatar TEXT,
          bio TEXT,
          dream_stats TEXT,
          sleep_profile TEXT,
          is_anonymous INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          last_login TEXT
        )
      `, (err) => { if (err) reject(err); });

      // 梦境记录表
      db.run(`
        CREATE TABLE IF NOT EXISTS dreams (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT,
          content TEXT NOT NULL,
          content_vector TEXT,
          dream_type TEXT CHECK(dream_type IN ('normal', 'lucid', 'nightmare', 'recurring', 'prophetic', 'false_awakening', 'sleep_paralysis')),
          clarity INTEGER CHECK(clarity BETWEEN 1 AND 10),
          emotion TEXT,
          emotion_score REAL,
          sleep_quality INTEGER CHECK(sleep_quality BETWEEN 1 AND 10),
          sleep_duration INTEGER,
          bed_time TEXT,
          wake_time TEXT,
          is_shared INTEGER DEFAULT 0,
          is_anonymous INTEGER DEFAULT 1,
          likes INTEGER DEFAULT 0,
          views INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => { if (err) reject(err); });

      // 梦境标签表
      db.run(`
        CREATE TABLE IF NOT EXISTS dream_tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          dream_id TEXT NOT NULL,
          tag TEXT NOT NULL,
          tag_type TEXT CHECK(tag_type IN ('symbol', 'person', 'place', 'theme', 'emotion')),
          FOREIGN KEY (dream_id) REFERENCES dreams(id) ON DELETE CASCADE
        )
      `, (err) => { if (err) reject(err); });

      // 梦境分析表
      db.run(`
        CREATE TABLE IF NOT EXISTS dream_analysis (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          dream_id TEXT UNIQUE NOT NULL,
          themes TEXT,
          symbols TEXT,
          interpretation TEXT,
          sentiment_score REAL,
          keywords TEXT,
          similar_dreams TEXT,
          analyzed_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (dream_id) REFERENCES dreams(id) ON DELETE CASCADE
        )
      `, (err) => { if (err) reject(err); });

      // 梦境共鸣表（相似梦境连接）
      db.run(`
        CREATE TABLE IF NOT EXISTS dream_resonances (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          dream_id_1 TEXT NOT NULL,
          dream_id_2 TEXT NOT NULL,
          similarity_score REAL NOT NULL,
          resonance_type TEXT CHECK(resonance_type IN ('theme', 'symbol', 'emotion', 'content')),
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(dream_id_1, dream_id_2),
          FOREIGN KEY (dream_id_1) REFERENCES dreams(id) ON DELETE CASCADE,
          FOREIGN KEY (dream_id_2) REFERENCES dreams(id) ON DELETE CASCADE
        )
      `, (err) => { if (err) reject(err); });

      // 梦境联机房间表
      db.run(`
        CREATE TABLE IF NOT EXISTS dream_rooms (
          id TEXT PRIMARY KEY,
          host_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          theme TEXT,
          max_participants INTEGER DEFAULT 5,
          is_active INTEGER DEFAULT 1,
          is_private INTEGER DEFAULT 0,
          password TEXT,
          scheduled_at TEXT,
          started_at TEXT,
          ended_at TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => { if (err) reject(err); });

      // 房间参与者表
      db.run(`
        CREATE TABLE IF NOT EXISTS room_participants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          room_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
          left_at TEXT,
          is_ready INTEGER DEFAULT 0,
          dream_shared INTEGER DEFAULT 0,
          UNIQUE(room_id, user_id),
          FOREIGN KEY (room_id) REFERENCES dream_rooms(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => { if (err) reject(err); });

      // 梦境评论表
      db.run(`
        CREATE TABLE IF NOT EXISTS dream_comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          dream_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          content TEXT NOT NULL,
          is_interpretation INTEGER DEFAULT 0,
          likes INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (dream_id) REFERENCES dreams(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => { if (err) reject(err); });

      // 用户关注表
      db.run(`
        CREATE TABLE IF NOT EXISTS user_follows (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          follower_id TEXT NOT NULL,
          following_id TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(follower_id, following_id),
          FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => { if (err) reject(err); });

      // 梦境收藏表
      db.run(`
        CREATE TABLE IF NOT EXISTS dream_favorites (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          dream_id TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, dream_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (dream_id) REFERENCES dreams(id) ON DELETE CASCADE
        )
      `, (err) => { if (err) reject(err); });

      // 个人梦境词典
      db.run(`
        CREATE TABLE IF NOT EXISTS dream_dictionary (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          symbol TEXT NOT NULL,
          meaning TEXT NOT NULL,
          occurrence_count INTEGER DEFAULT 1,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, symbol),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => { if (err) reject(err); resolve(); });
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

module.exports = { db, initDatabase, run, get, all };
