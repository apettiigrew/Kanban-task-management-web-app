'use client';

import { useFormStatus } from 'react-dom';
import { updateProject } from '@/features/project/actions/project';
import { useActionState } from 'react';
import styles from './update-project-modal.module.css';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { Project } from '@/types/project';
import AppButton from '@/components/button/app-button';

interface UpdateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdated: () => void;
  project: Project;
}

type ActionState = {
  success: boolean;
  project?: any;
  error?: string;
};

const initialState: ActionState = {
  success: false
};

const wrappedUpdateProject = async (_prevState: ActionState, formData: FormData) => {
  const id = formData.get('id') as string;
  return updateProject(id, Object.fromEntries(formData));
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <AppButton type="submit" className={styles.submitButton} disabled={pending}>
      {pending ? 'Updating...' : 'Update Project'}
    </AppButton>
  );
}

export default function UpdateProjectModal({ 
  isOpen, 
  onClose, 
  onProjectUpdated, 
  project 
}: UpdateProjectModalProps) {
  const [state, formAction] = useActionState(wrappedUpdateProject, initialState);

  useEffect(() => {
    if (state.success && isOpen) {
      onProjectUpdated();
    }
  }, [state.success, isOpen, onProjectUpdated]);

  if (!isOpen) return null;

  const modal = (
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
              defaultValue={project.title}
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
              defaultValue={project.description}
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