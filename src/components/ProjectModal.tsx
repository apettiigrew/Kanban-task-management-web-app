'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createProject } from '@/features/project/actions/project';
import styles from './ProjectModal.module.css';
import { useEffect } from 'react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
} 

const initialState = {
  success: false,
  error: null,
  project: []
};

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit" 
      className={styles.submitButton}
      disabled={pending}
    >
      {pending ? 'Creating...' : 'Create Project'}
    </button>
  );
}

export default function ProjectModal({ isOpen, onClose, onProjectCreated }: ProjectModalProps) {
  const [state, formAction] = useActionState(createProject, initialState);

  useEffect(() => {
    if (state.success) {
      onProjectCreated();
    }
  }, [state.success, onProjectCreated]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Create New Project</h2>
        <form action={formAction} className={styles.form}>
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