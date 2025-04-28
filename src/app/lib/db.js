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

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK(status IN ('todo', 'doing', 'done')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(projectId) REFERENCES projects(id) ON DELETE CASCADE
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

async function createTask(task) {
  const id = Math.random().toString(36).substr(2, 9);
  const stmt = db.prepare(`
    INSERT INTO tasks (id, projectId, title, description, status)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(id, task.projectId, task.title, task.description, task.status);
  return id;
}

async function updateTask(id, updates) {
  const stmt = db.prepare(`
    UPDATE tasks
    SET title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = COALESCE(?, status)
    WHERE id = ?
  `);
  stmt.run(updates.title, updates.description, updates.status, id);
}

async function deleteTask(id) {
  const stmt = db.prepare(`
    DELETE FROM tasks
    WHERE id = ?
  `);
  stmt.run(id);
}

async function getTasksByProject(projectId) {
  const stmt = db.prepare(`
    SELECT * FROM tasks
    WHERE projectId = ?
    ORDER BY createdAt ASC
  `);
  return stmt.all(projectId);
}

// Export the functions
module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  createTask,
  updateTask,
  deleteTask,
  getTasksByProject,
}; 