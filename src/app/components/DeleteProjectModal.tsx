'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { deleteProject } from '../actions/project';
import styles from './ProjectModal.module.css';

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectDeleted: () => void;
  project: {
    id: string;
    title: string;
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
      className={styles.deleteConfirmButton}
      disabled={pending}
    >
      {pending ? 'Deleting...' : 'Delete'}
    </button>
  );
}

export default function DeleteProjectModal({ isOpen, onClose, onProjectDeleted, project }: DeleteProjectModalProps) {
  const [state, formAction] = useActionState(deleteProject, initialState);

  useEffect(() => {
    if (state.success) {
      onProjectDeleted();
    }
  }, [state.success, onProjectDeleted]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.deleteModal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Delete Project</h2>
        <form action={formAction} className={styles.form}>
          <input type="hidden" name="id" value={project.id} />
          {state.error && !state.success && (
            <div className={styles.error}>{state.error}</div>
          )}
          <p className={styles.deleteMessage}>
            Are you sure you want to delete "{project.title}"? This action cannot be undone.
          </p>
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