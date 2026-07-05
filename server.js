const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 5000;
const DB_FILE = "school.db";

// Middleware to parse incoming JSON bodies automatically
app.use(express.json());

// Establish connection tracking to the local SQLite database binary file
const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log(`Connected directly to persistent storage: ${path.resolve(DB_FILE)}`);
        // Setup initial database rows schema if missing
        db.run(`
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                grade TEXT NOT NULL
            )
        `);
    }
});

// Serve frontend visual asset endpoints
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static scripts (looks for app.js in same directory)
app.use(express.static(__dirname));

// 🟢 GET: Fetch all profiles out of school.db
app.get('/api/students', (req, res) => {
    db.all("SELECT id, name, grade FROM students", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 🔵 POST: Save a new record profile
app.post('/api/students', (req, res) => {
    const { name, grade } = req.body;
    if (!name || !grade) return res.status(400).json({ error: "Missing required values." });

    db.run("INSERT INTO students (name, grade) VALUES (?, ?)", [name.trim(), grade.trim().toUpperCase()], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, name, grade: grade.toUpperCase() });
    });
});

// 🟠 PUT: Modify an existing database entry
app.put('/api/students/:id', (req, res) => {
    const { name, grade } = req.body;
    const { id } = req.params;

    db.run("UPDATE students SET name = ?, grade = ? WHERE id = ?", [name.trim(), grade.trim().toUpperCase(), id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Student profile not found." });
        res.json({ success: true });
    });
});

// 🔴 DELETE: Clear a profile sequence out of the database matrix
app.delete('/api/students/:id', (req, res) => {
    const { id } = req.params;

    db.run("DELETE FROM students WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Student profile not found." });
        res.json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Node.js Express server running smoothly at http://localhost:${PORT}`);
});