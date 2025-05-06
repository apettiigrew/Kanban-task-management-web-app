import { AddProjectForm } from "../forms/add-project-form";
import { Modal } from "./modal";

interface AddProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ open, onClose, onSubmit }) => {
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
