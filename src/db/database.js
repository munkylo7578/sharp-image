const sqlite3 = require("sqlite3").verbose();
const path = require("path");
require("dotenv").config();

const dbPath = process.env.DB_PATH || "./data/images.db";

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  getImageByName(name) {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM images WHERE name = ?";
      this.db.get(query, [name], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
  async getImages(page = 1, pageSize = 10) {
    return new Promise((resolve, reject) => {
      const limit = Number(pageSize) > 0 ? Number(pageSize) : 10;
      const pageNumber = Number(page) > 0 ? Number(page) : 1;
      const offset = (pageNumber - 1) * limit;

      const query = `SELECT * FROM images ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      this.db.all(query, [limit, offset], (err, rows) => {
        if (err) {
          reject(new Error(`Failed to get images: ${err.message}`));
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = Database;
