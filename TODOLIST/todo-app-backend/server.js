const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const JWT_SECRET = 'your_secret_key'; // Use a secure key in production

// Authentication
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: err.message });
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'User not found' });

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    });
  });
});

// CRUD Operations
app.get('/todos', (req, res) => {
  const userId = req.query.userId;
  db.all('SELECT * FROM todos WHERE userId = ?', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/todos', (req, res) => {
  const { userId, title, completed } = req.body;
  db.run('INSERT INTO todos (userId, title, completed) VALUES (?, ?, ?)', [userId, title, completed], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

app.put('/todos/:id', (req, res) => {
  const { title, completed } = req.body;
  db.run('UPDATE todos SET title = ?, completed = ? WHERE id = ?', [title, completed, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ changes: this.changes });
  });
});

app.delete('/todos/:id', (req, res) => {
  db.run('DELETE FROM todos WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ changes: this.changes });
  });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

// All other routes should be handled by React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
