'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { deleteTask } from '@/features/project/actions/task';
import styles from './delete-task-modal.module.css';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';

interface Task {
  id: string;
  title: string;
}

interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskDeleted: () => void;
  projectId: string;
  task: Task;
}

type ActionState = {
  success: boolean;
  task?: any;
  error?: string;
};

const initialState: ActionState = {
  success: false
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.deleteButton} disabled={pending}>
      {pending ? 'Deleting...' : 'Delete Task'}
    </button>
  );
}

export default function DeleteTaskModal({ 
  isOpen, 
  onClose, 
  onTaskDeleted, 
  projectId,
  task 
}: DeleteTaskModalProps) {
  const [state, formAction] = useActionState(deleteTask, initialState);

  useEffect(() => {
    if (state.success && isOpen) {
      onTaskDeleted();
    }
  }, [state.success, isOpen, onTaskDeleted]);

  if (!isOpen) return null;

  const modal = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>Delete Task</h2>
        <form action={formAction} className={styles.form}>
          <input type="hidden" name="id" value={task.id} />
          <input type="hidden" name="projectId" value={projectId} />
          {state.error && !state.success && (
            <div className={styles.error}>{state.error}</div>
          )}
          <p className={styles.message}>
            Are you sure you want to delete &quot;{task.title}&quot;? This action cannot be undone.
          </p>
          <div className={styles.buttons}>
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