import React from 'react';
import styles from './delete-list-modal.module.scss';
import { Modal } from './modal';
import { AppButton } from '../button/AppButton';

interface DeleteListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  listName: string;
}

export const DeleteListModal: React.FC<DeleteListModalProps> = ({ isOpen, onClose, onDelete, listName }) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h3 className={styles.title}>Delete this list</h3>
        <p>Are you sure you want to delete the ‘{listName}’ list and all of its cards? This action cannot be undone.</p>
        <div className={styles.buttonGroup}>
          <AppButton className={styles.button} variant="secondary" onClick={onClose}>Cancel</AppButton>
          <AppButton className={styles.button} variant="destructive" onClick={onDelete}>Delete</AppButton>
        </div>
      </div>
    </Modal>
  );
};
