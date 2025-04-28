'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { deleteTask } from '../actions/task';
import styles from './ProjectModal.module.css';

interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskDeleted: () => void;
  projectId: string;
  task: {
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
    <button type="submit" className={styles.deleteConfirmButton} disabled={pending}>
      {pending ? 'Deleting...' : 'Delete'}
    </button>
  );
}

export default function DeleteTaskModal({ isOpen, onClose, onTaskDeleted, projectId, task }: DeleteTaskModalProps) {
  const [state, formAction] = useActionState(deleteTask, initialState);

  // Call onTaskDeleted on success
  if (state.success && isOpen) {
    onTaskDeleted();
  }

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.deleteModal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Delete Task</h2>
        <form action={formAction} className={styles.form}>
          <input type="hidden" name="id" value={task.id} />
          <input type="hidden" name="projectId" value={projectId} />
          {state.error && !state.success && (
            <div className={styles.error}>{state.error}</div>
          )}
          <p className={styles.deleteMessage}>
            Are you sure you want to delete "{task.title}"? This action cannot be undone.
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