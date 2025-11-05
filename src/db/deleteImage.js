const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './data/images.db';

// Get command line arguments
const args = process.argv.slice(2);
const name = args[0];

if (!name) {
  console.error('Usage: node src/db/deleteImage.js <name>');
  console.error('Example: node src/db/deleteImage.js my-image');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

// First check if image exists
db.get('SELECT * FROM images WHERE name = ?', [name], (err, row) => {
  if (err) {
    console.error('Error querying database:', err.message);
    db.close();
    process.exit(1);
  }

  if (!row) {
    console.error(`Error: Image with name "${name}" not found`);
    db.close();
    process.exit(1);
  }

  // Delete the image
  db.run('DELETE FROM images WHERE name = ?', [name], function(err) {
    if (err) {
      console.error('Error deleting image:', err.message);
      db.close();
      process.exit(1);
    } else {
      console.log(`Image deleted successfully: ${name} (ID: ${row.id})`);
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        }
        process.exit(0);
      });
    }
  });
});

