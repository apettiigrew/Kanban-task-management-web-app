import React, { useState } from 'react';
import styles from './add-project-form.module.scss';
import { AppButton } from '../button/AppButton';

interface AddProjectFormProps {
  onSubmit: (title: string) => void;
}

export const AddProjectForm: React.FC<AddProjectFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setError('');
    onSubmit(title.trim());
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label} htmlFor="project-title">Project Title</label>
      <input
        id="project-title"
        className={styles.input}
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Enter project title"
        autoFocus
      />
      {error && <div className={styles.error}>{error}</div>}
      <AppButton type="submit" variant="primary" size="large">
        Add Project
      </AppButton>
    </form>
  );
};

