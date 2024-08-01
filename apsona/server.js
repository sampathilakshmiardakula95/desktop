const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3000;

let notes = [];

app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/notes", (req, res) => {
  res.json(notes);
});

app.post("/notes", (req, res) => {
  const note = { id: uuidv4(), content: req.body.content };
  notes.push(note);
  res.status(201).json(note);
});

app.delete("/notes/:id", (req, res) => {
  notes = notes.filter((note) => note.id !== req.params.id);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
