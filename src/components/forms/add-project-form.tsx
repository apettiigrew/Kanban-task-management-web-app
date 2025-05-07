import React, { useState } from 'react';
import styles from './add-project-form.module.scss';
import { AppButton } from '../button/AppButton';

interface ProjectData {
  title: string;
  description: string;
}

interface AddProjectFormProps {
  onSubmit: (data: ProjectData) => void;
}

export const AddProjectForm: React.FC<AddProjectFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setError('');
    onSubmit({
      title: title.trim(),
      description: description.trim()
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Add Project</h2>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="project-title">Title</label>
        <input
          id="project-title"
          className={styles.input}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter project title"
          autoFocus
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="project-description">Description</label>
        <textarea
          id="project-description"
          className={styles.textarea}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Enter project description"
          rows={4}
        />
      </div>
      {error && <div className={styles.error}>{error}</div>}
      <AppButton type="submit" variant="primary" size="large">
        Add Project
      </AppButton>
    </form>
  );
};

