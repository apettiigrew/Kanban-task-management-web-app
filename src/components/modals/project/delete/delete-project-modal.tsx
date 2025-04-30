'use client';

import { useFormStatus } from 'react-dom';
import { deleteProject } from '@/features/project/actions/project';
import { useActionState } from 'react';
import styles from './delete-project-modal.module.css';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Project } from '@/types/project';


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
    <button type="submit" className={styles.deleteButton} disabled={pending}>
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
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (state.success && isOpen) {
      onProjectDeleted();
      console.log("pathname", pathname);
      if (pathname === `/projects/${project.id}`) {
        router.push('/projects');
      }
    }
  }, [state.success, isOpen, onProjectDeleted, pathname, project.id, router]);

  if (!isOpen) return null;

  const modal = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>Delete Project</h2>
        <form action={formAction} className={styles.form}>
          <input type="hidden" name="id" value={project.id} />
          {state.error && !state.success && (
            <div className={styles.error}>{state.error}</div>
          )}
          <p className={styles.message}>
            Are you sure you want to delete &quot;{project.title}&quot;? This action cannot be undone.
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