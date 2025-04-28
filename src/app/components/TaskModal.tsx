'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createTask, updateTask } from '../actions/task';
import styles from './ProjectModal.module.css';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskSaved: () => void;
  projectId: string;
  task?: {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'doing' | 'done';
  };
}

const initialState = {
  message: null,
  success: false,
};

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.submitButton} disabled={pending}>
      {pending ? (isEdit ? 'Saving...' : 'Creating...') : isEdit ? 'Save Changes' : 'Create Task'}
    </button>
  );
}

export default function TaskModal({ isOpen, onClose, onTaskSaved, projectId, task }: TaskModalProps) {
  const isEdit = !!task;
  const [state, formAction] = useActionState(isEdit ? updateTask : createTask, initialState);

  // Call onTaskSaved on success
  if (state.success && isOpen) {
    onTaskSaved();
  }

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>{isEdit ? 'Edit Task' : 'Create Task'}</h2>
        <form action={formAction} className={styles.form}>
          {isEdit && <input type="hidden" name="id" value={task.id} />}
          <input type="hidden" name="projectId" value={projectId} />
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>Title</label>
            <input
              type="text"
              id="title"
              name="title"
              className={styles.input}
              defaultValue={task?.title || ''}
              placeholder="e.g. Design login page"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>Description</label>
            <textarea
              id="description"
              name="description"
              className={styles.textarea}
              defaultValue={task?.description || ''}
              placeholder="e.g. Implement the login UI and validation"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="status" className={styles.label}>Status</label>
            <select
              id="status"
              name="status"
              className={styles.input}
              defaultValue={task?.status || 'todo'}
              required
            >
              <option value="todo">To Do</option>
              <option value="doing">Doing</option>
              <option value="done">Done</option>
            </select>
          </div>
          {state.error && !state.success && (
            <div className={styles.error}>{state.error}</div>
          )}
          <div className={styles.buttonGroup}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <SubmitButton isEdit={isEdit} />
          </div>
        </form>
      </div>
    </div>
  );
} 