const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './data/images.db';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

// Get optional filter argument
const filter = process.argv[2];

let query = 'SELECT * FROM images';
const params = [];

if (filter) {
  query += ' WHERE name LIKE ? OR url LIKE ?';
  const searchTerm = `%${filter}%`;
  params.push(searchTerm, searchTerm);
}

query += ' ORDER BY created_at DESC';

db.all(query, params, (err, rows) => {
  if (err) {
    console.error('Error querying database:', err.message);
    db.close();
    process.exit(1);
  }

  if (rows.length === 0) {
    console.log('No images found in database.');
    if (filter) {
      console.log(`(filtered by: "${filter}")`);
    }
  } else {
    console.log(`\nFound ${rows.length} image(s):\n`);
    console.log('─'.repeat(80));
    console.log(
      'ID'.padEnd(6) +
      'Name'.padEnd(30) +
      'URL'.padEnd(40) +
      'Created At'
    );
    console.log('─'.repeat(80));
    
    rows.forEach((row) => {
      const date = new Date(row.created_at).toLocaleString();
      console.log(
        String(row.id).padEnd(6) +
        row.name.padEnd(30) +
        row.url.padEnd(40) +
        date
      );
    });
    console.log('─'.repeat(80));
  }

  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    }
    process.exit(0);
  });
});

