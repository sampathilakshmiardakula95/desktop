// app.js
document.addEventListener('DOMContentLoaded', () => {
    const addNoteButton = document.getElementById('add-note');
    const noteTitleInput = document.getElementById('note-title');
    const noteContentInput = document.getElementById('note-content');
    const notesContainer = document.getElementById('notes-container');

    addNoteButton.addEventListener('click', addNote);
    loadNotes();

    function addNote() {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();

        if (title && content) {
            const note = { title, content };
            saveNote(note);
            displayNote(note);
            noteTitleInput.value = '';
            noteContentInput.value = '';
        }
    }

    function displayNote(note) {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note');
        noteElement.innerHTML = `
            <h3>${note.title}</h3>
            <p>${note.content}</p>
        `;
        notesContainer.appendChild(noteElement);
    }

    function saveNote(note) {
        fetch('/api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(note),
        })
        .then(response => response.json())
        .then(data => console.log('Note saved:', data))
        .catch(error => console.error('Error saving note:', error));
    }

    function loadNotes() {
        fetch('/api/notes')
        .then(response => response.json())
        .then(notes => {
            notesContainer.innerHTML = '';
            notes.forEach(displayNote);
        })
        .catch(error => console.error('Error loading notes:', error));
    }
});