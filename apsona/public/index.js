const notesContainer = document.getElementById("notesContainer");
const noteContent = document.getElementById("noteContent");

function fetchNotes() {
  fetch("/notes")
    .then((response) => response.json())
    .then((data) => {
      notesContainer.innerHTML = "";
      data.forEach((note) => {
        const noteElement = document.createElement("div");
        noteElement.className = "note";
        noteElement.innerHTML = `<p>${note.content}</p><button onclick="deleteNote('${note.id}')">Delete</button>`;
        notesContainer.appendChild(noteElement);
      });
    });
}

function addNote() {
  const content = noteContent.value;
  if (content.trim() === "") return;

  fetch("/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  }).then(() => {
    noteContent.value = "";
    fetchNotes();
  });
}

function deleteNote(id) {
  fetch(`/notes/${id}`, {
    method: "DELETE",
  }).then(() => {
    fetchNotes();
  });
}

document.addEventListener("DOMContentLoaded", fetchNotes);
