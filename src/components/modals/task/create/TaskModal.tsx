'use client';

import { useActionState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createTask, updateTask } from '@/features/project/actions/task';
import styles from './TaskModal.module.css';

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

type ActionState = {
  success: boolean;
  task?: any;
  error?: string;
} | null;

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit" 
      className={styles.submitButton}
      disabled={pending}
    >
      {pending ? 'Saving...' : 'Save Task'}
    </button>
  );
}

export default function TaskModal({ isOpen, onClose, onTaskSaved, projectId, task }: TaskModalProps) {
  const initialState: ActionState = null;

  const [state, formAction] = useActionState(task ? updateTask : createTask,initialState);

  useEffect(() => {
    if (state?.success) {
      onTaskSaved();
    }
  }, [state?.success, onTaskSaved]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>{task ? 'Edit Task' : 'Create Task'}</h2>
        <form action={formAction} className={styles.form}>
          <input type="hidden" name="projectId" value={projectId} />
          {task && <input type="hidden" name="id" value={task.id} />}
          {state?.error && (
            <div className={styles.error}>{state.error}</div>
          )}
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Task Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className={styles.input}
              placeholder="e.g. Research competitors"
              defaultValue={task?.title}
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
              placeholder="e.g. Analyze top 5 competitors in our market"
              defaultValue={task?.description}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="status" className={styles.label}>
              Status
            </label>
            <select
              id="status"
              name="status"
              className={styles.select}
              defaultValue={task?.status || 'todo'}
            >
              <option value="todo">Todo</option>
              <option value="doing">Doing</option>
              <option value="done">Done</option>
            </select>
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