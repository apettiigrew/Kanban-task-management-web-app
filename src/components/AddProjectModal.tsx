import React from 'react';
import Modal from './Modal';
import AddProjectForm from './AddProjectForm';

interface AddProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ open, onClose, onSubmit }) => {
  const handleSubmit = (title: string) => {
    onSubmit(title);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <AddProjectForm onSubmit={handleSubmit} />
    </Modal>
  );
};

export default AddProjectModal; 