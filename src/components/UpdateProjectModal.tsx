'use client';

import { useEffect } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateProject } from '@/features/project/actions/project';
import styles from './ProjectModal.module.css';

interface UpdateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdated: () => void;
  project: {
    id: string;
    title: string;
    description: string;
  };
}

const initialState = {
  message: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit" 
      className={styles.submitButton}
      disabled={pending}
    >
      {pending ? 'Updating...' : 'Update Project'}
    </button>
  );
}

export default function UpdateProjectModal({ isOpen, onClose, onProjectUpdated, project }: UpdateProjectModalProps) {
  const [state, formAction] = useActionState(updateProject, initialState);

  useEffect(() => {
    if (state.success) {
      onProjectUpdated();
    }
  }, [state.success, onProjectUpdated]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Update Project</h2>
        <form action={formAction} className={styles.form}>
          <input type="hidden" name="id" value={project.id} />
          {state.error && !state.success && (
            <div className={styles.error}>{state.error}</div>
          )}
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Project Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className={styles.input}
              placeholder="e.g. Marketing Campaign"
              defaultValue={project.title}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Project Description
            </label>
            <textarea
              id="description"
              name="description"
              className={styles.textarea}
              placeholder="e.g. This project will handle our Q4 marketing initiatives"
              defaultValue={project.description}
              required
            />
          </div>
          <div className={styles.buttonGroup}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
} 