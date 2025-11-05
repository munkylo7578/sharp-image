const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './data/images.db';

// Get command line arguments
const args = process.argv.slice(2);
const name = args[0];
const url = args[1];

if (!name || !url) {
  console.error('Usage: node src/db/addImage.js <name> <url>');
  console.error('Example: node src/db/addImage.js my-image folder/my-image.jpg');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

db.run(
  'INSERT INTO images (name, url) VALUES (?, ?)',
  [name, url],
  function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint')) {
        console.error(`Error: Image with name "${name}" already exists`);
      } else {
        console.error('Error inserting image:', err.message);
      }
      db.close();
      process.exit(1);
    } else {
      console.log(`Image added successfully: ${name} -> ${url} (ID: ${this.lastID})`);
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        }
        process.exit(0);
      });
    }
  }
);

