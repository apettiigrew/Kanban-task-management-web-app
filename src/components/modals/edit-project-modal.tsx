import React from 'react';
import { Modal } from './modal';
import styles from './add-project-modal.module.scss';
import { Project } from '@/hooks/useProjects';
import { EditProjectForm } from '@/components/forms/edit-project-form';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project: Project;
}

export function EditProjectModal({ isOpen, onClose, onSuccess, project }: EditProjectModalProps) {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h3 className={styles.title}>Update Project</h3>
        <EditProjectForm
          project={project}
          onClose={onClose} 
          onSuccess={onSuccess} 
        />
      </div>
    </Modal>
  );
} 