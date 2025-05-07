import { AddProjectForm } from "../forms/add-project-form";
import { Modal } from "./modal";

interface ProjectData {
  title: string;
  description: string;
}

interface AddProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectData) => void;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ open, onClose, onSubmit }) => {
  const handleSubmit = (data: ProjectData) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <AddProjectForm onSubmit={handleSubmit} />
    </Modal>
  );
};
