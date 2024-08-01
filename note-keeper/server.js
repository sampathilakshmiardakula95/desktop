// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const dataFile = path.join(__dirname, 'notes.json');

app.get('/api/notes', async (req, res) => {
    try {
        const data = await fs.readFile(dataFile, 'utf8');
        const notes = JSON.parse(data);
        res.json(notes);
    } catch (error) {
        console.error('Error reading notes:', error);
        res.status(500).json({ error: 'Error reading notes' });
    }
});

app.post('/api/notes', async (req, res) => {
    try {
        const note = req.body;
        const data = await fs.readFile(dataFile, 'utf8');
        const notes = JSON.parse(data);
        notes.push(note);
        await fs.writeFile(dataFile, JSON.stringify(notes, null, 2));
        res.json(note);
    } catch (error) {
        console.error('Error saving note:', error);
        res.status(500).json({ error: 'Error saving note' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});