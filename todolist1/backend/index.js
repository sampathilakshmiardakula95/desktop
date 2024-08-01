const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        description TEXT,
        status TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);
  }
});

// Register
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  db.run(
    `INSERT INTO users (username, password) VALUES (?, ?)`,
    [username, hashedPassword],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'User registration failed' });
      }
      const token = jwt.sign({ id: this.lastID }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      res.status(200).json({ auth: true, token });
    }
  );
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err || !user) {
      return res.status(500).json({ error: 'User not found' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ auth: false, token: null });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.status(200).json({ auth: true, token });
  });
});

// JWT Verification Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (!token) {
    return res.status(403).json({ auth: false, message: 'No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
    }
    req.userId = decoded.id;
    next();
  });
};

// Create Todo
app.post('/todos', verifyToken, (req, res) => {
  const { description } = req.body;
  const userId = req.userId;

  db.run(
    `INSERT INTO todos (user_id, description, status) VALUES (?, ?, ?)`,
    [userId, description, 'pending'],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create todo' });
      }
      res.status(200).json({ id: this.lastID, description, status: 'pending' });
    }
  );
});

// Read Todos
app.get('/todos', verifyToken, (req, res) => {
  const userId = req.userId;

  db.all(`SELECT * FROM todos WHERE user_id = ?`, [userId], (err, todos) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch todos' });
    }
    res.status(200).json(todos);
  });
});

// Update Todo
app.put('/todos/:id', verifyToken, (req, res) => {
  const { description, status } = req.body;
  const todoId = req.params.id;

  db.run(
    `UPDATE todos SET description = ?, status = ? WHERE id = ? AND user_id = ?`,
    [description, status, todoId, req.userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update todo' });
      }
      res.status(200).json({ message: 'Todo updated successfully' });
    }
  );
});

// Delete Todo
app.delete('/todos/:id', verifyToken, (req, res) => {
  const todoId = req.params.id;

  db.run(`DELETE FROM todos WHERE id = ? AND user_id = ?`, [todoId, req.userId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete todo' });
    }
    res.status(200).json({ message: 'Todo deleted successfully' });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
