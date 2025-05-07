import React from 'react';
import { Modal } from './modal';
import styles from './add-project-modal.module.scss';
import { AddProjectForm } from '../forms/add-project-form';
interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddProjectModal({ isOpen, onClose, onSuccess }: AddProjectModalProps) {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h3 className={styles.title}>Create New Project</h3>
        <AddProjectForm onClose={onClose} onSuccess={onSuccess} />
      </div>
    </Modal>
  );
}
