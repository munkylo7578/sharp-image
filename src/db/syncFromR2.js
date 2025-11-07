const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();
const R2Service = require('../services/r2Service');

const dbPath = process.env.DB_PATH || './data/images.db';

// Get optional prefix argument
const prefix = process.argv[2] || '';

async function syncFromR2() {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      process.exit(1);
    }
  });

  const r2Service = new R2Service();

  try {
    console.log('Fetching objects from R2 bucket...');
    if (prefix) {
      console.log(`Filtering by prefix: "${prefix}"`);
    }
    
    const objects = await r2Service.listObjects(prefix);
    
    if (objects.length === 0) {
      console.log('No objects found in R2 bucket.');
      if (prefix) {
        console.log(`(filtered by prefix: "${prefix}")`);
      }
      db.close();
      process.exit(0);
    }

    console.log(`Found ${objects.length} object(s) in R2 bucket.\n`);
    console.log('Syncing to database...\n');

    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    // Process each object
    for (const object of objects) {
      const key = object.Key;
      
      // Extract name from key (use filename or full key if no extension)
      const name = path.basename(key) || key;
      
      // Use the key as the URL
      const url = key;

      // Insert into database (using INSERT OR IGNORE to handle duplicates)
      await new Promise((resolve) => {
        db.run(
          'INSERT OR IGNORE INTO images (name, url) VALUES (?, ?)',
          [name, url],
          function(err) {
            if (err) {
              console.error(`Error inserting ${name}: ${err.message}`);
              errors++;
            } else if (this.changes === 0) {
              // No changes means it was a duplicate (INSERT OR IGNORE)
              console.log(`Skipped (already exists): ${name} -> ${url}`);
              skipped++;
            } else {
              console.log(`Inserted: ${name} -> ${url} (ID: ${this.lastID})`);
              inserted++;
            }
            resolve();
          }
        );
      });
    }

    console.log('\n' + '─'.repeat(80));
    console.log(`Sync complete!`);
    console.log(`  Inserted: ${inserted}`);
    console.log(`  Skipped (duplicates): ${skipped}`);
    if (errors > 0) {
      console.log(`  Errors: ${errors}`);
    }
    console.log('─'.repeat(80));

  } catch (error) {
    console.error('Error syncing from R2:', error.message);
    db.close();
    process.exit(1);
  }

  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
      process.exit(1);
    }
    process.exit(0);
  });
}

// Run the sync
syncFromR2();

