const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './data/images.db';
const dbDir = path.dirname(dbPath);

// Create data directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Create images table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Images table created or already exists');
    }
  });

  // Insert sample data (optional - remove in production)
  db.run(`
    INSERT OR IGNORE INTO images (name, url) VALUES
    ('sample1', 'sample1.jpg'),
    ('sample2', 'sample2.png')
  `, (err) => {
    if (err) {
      console.error('Error inserting sample data:', err.message);
    } else {
      console.log('Sample data inserted (if not exists)');
    }
  });

  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

