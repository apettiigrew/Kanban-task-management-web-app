'use client';

import { useFormStatus } from 'react-dom';
import { deleteProject } from '@/features/project/actions/project';
import { useActionState } from 'react';
import styles from './delete-project-modal.module.css';
import { createPortal } from 'react-dom';

interface Project {
  id: string;
  title: string;
}

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectDeleted: () => void;
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

const wrappedDeleteProject = async (_prevState: ActionState, formData: FormData) => {
  const id = formData.get('id') as string;
  return deleteProject(id);
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.deleteConfirmButton} disabled={pending}>
      {pending ? 'Deleting...' : 'Delete Project'}
    </button>
  );
}

export default function DeleteProjectModal({ 
  isOpen, 
  onClose, 
  onProjectDeleted, 
  project 
}: DeleteProjectModalProps) {
  const [state, formAction] = useActionState(wrappedDeleteProject, initialState);

  // Call onProjectDeleted on success
  if (state.success && isOpen) {
    onProjectDeleted();
  }

  if (!isOpen) return null;

  const modal = (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.deleteModal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Delete Project</h2>
        <form action={formAction} className={styles.form}>
          <input type="hidden" name="id" value={project.id} />
          {state.error && !state.success && (
            <div className={styles.error}>{state.error}</div>
          )}
          <p className={styles.deleteMessage}>
            Are you sure you want to delete &quot;{project.title}&quot;? This action cannot be undone.
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

  return createPortal(modal, document.body);
} 