// database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)");
  db.run("CREATE TABLE todos (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, title TEXT, completed BOOLEAN, FOREIGN KEY(userId) REFERENCES users(id))");
});

module.exports = db;
