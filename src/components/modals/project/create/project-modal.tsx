'use client';

import { useFormStatus } from 'react-dom';
import { createProject } from '@/features/project/actions/project';
import { useActionState } from 'react';
import styles from './project-modal.module.css';
import { createPortal } from 'react-dom';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.submitButton} disabled={pending}>
      {pending ? 'Creating...' : 'Create Project'}
    </button>
  );
}

const initialState = {
  success: false,
  error: null,
  project: null
};

export default function ProjectModal({ isOpen, onClose, onProjectCreated }: ProjectModalProps) {
  const [state, formAction] = useActionState(createProject, initialState);

  // Call onProjectCreated on success
  if (state.success && isOpen) {
    onProjectCreated();
  }

  if (!isOpen) return null;

  const modal = (
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
              placeholder="e.g. Web Design"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className={styles.textarea}
              placeholder="e.g. Design a responsive website for a client"
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

  return createPortal(modal, document.body);
} 