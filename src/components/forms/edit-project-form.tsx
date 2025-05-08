import React, { useState } from 'react';
import { AppInput } from '../input/AppInput';
import { AppButton } from '../button/AppButton';
import { useUpdateProject, Project } from '@/hooks/useProjects';
import styles from './edit-project-form.module.scss';

interface EditProjectFormProps {
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProjectForm({ project, onClose, onSuccess }: EditProjectFormProps) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description || '');
  const [error, setError] = useState('');

  const updateProject = useUpdateProject();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      await updateProject.mutateAsync({
        id: project.id,
        title: title.trim(),
        description: description.trim() || undefined,
      });
      onSuccess();
    } catch (err) {
      console.log(err);
      setError('Failed to update project');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="title">Title</label>
        <AppInput
          id="title"
          value={title}
          onChange={setTitle}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="description">Description</label>
        <AppInput
          id="description"
          value={description}
          onChange={setDescription}
        />
      </div>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.buttonGroup}>
        <AppButton type="button" variant="secondary" onClick={onClose}>
          Cancel
        </AppButton>
        <AppButton type="submit" disabled={updateProject.isPending}>
          Update Project
        </AppButton>
      </div>
    </form>
  );
} 