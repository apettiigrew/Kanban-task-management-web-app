const Database = require('better-sqlite3');
const db = new Database('kanban.db');

// Create projects table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function createProject(project) {
  const id = Math.random().toString(36).substr(2, 9);
  const stmt = db.prepare(`
    INSERT INTO projects (id, title, description)
    VALUES (?, ?, ?)
  `);
  stmt.run(id, project.title, project.description);
  return id;
}

async function getProjects() {
  const stmt = db.prepare(`
    SELECT * FROM projects
    ORDER BY createdAt DESC
  `);
  return stmt.all();
}

async function getProject(id) {
  const stmt = db.prepare(`
    SELECT * FROM projects
    WHERE id = ?
  `);
  return stmt.get(id);
}

async function updateProject(id, project) {
  const stmt = db.prepare(`
    UPDATE projects
    SET title = COALESCE(?, title),
        description = COALESCE(?, description)
    WHERE id = ?
  `);
  stmt.run(project.title, project.description, id);
}

async function deleteProject(id) {
  const stmt = db.prepare(`
    DELETE FROM projects
    WHERE id = ?
  `);
  stmt.run(id);
}

// Export the functions
module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject
}; 