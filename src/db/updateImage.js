const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './data/images.db';

// Get command line arguments
const args = process.argv.slice(2);
const name = args[0];
const newUrl = args[1];

if (!name || !newUrl) {
  console.error('Usage: node src/db/updateImage.js <name> <new-url>');
  console.error('Example: node src/db/updateImage.js my-image folder/new-image.jpg');
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

  // Update the image
  db.run(
    'UPDATE images SET url = ? WHERE name = ?',
    [newUrl, name],
    function(err) {
      if (err) {
        console.error('Error updating image:', err.message);
        db.close();
        process.exit(1);
      } else {
        console.log(`Image updated successfully: ${name}`);
        console.log(`  Old URL: ${row.url}`);
        console.log(`  New URL: ${newUrl}`);
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          }
          process.exit(0);
        });
      }
    }
  );
});

