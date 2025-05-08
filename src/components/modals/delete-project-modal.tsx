import { Project, useDeleteProject } from '@/hooks/useProjects';
import { AppButton } from '../button/AppButton';
import styles from './delete-project-modal.module.scss';
import { Modal } from './modal';

interface DeleteProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    project: Project;
}

export function DeleteProjectModal(props: DeleteProjectModalProps) {
    const { isOpen, onClose, onSuccess, project } = props;
    const title = project?.title;

    const deleteProject = useDeleteProject();

    const handleDeleteProject = () => {
        deleteProject.mutateAsync(project).then(() => {
            onSuccess();
        }).catch((error) => {
            throw new Error(error);
        });
    }
    return (
        <Modal open={isOpen} onClose={onClose}>
            <div className={styles.container}>
                <h3 className={styles.title}>Delete this board</h3>
                <p>Are you sure you want to delete the ‘{title}’ board? This action will remove all columns and tasks and cannot be reversed.</p>
                <div className={styles.buttonGroup}>
                    <AppButton className={styles.button} variant="secondary">Cancel</AppButton>
                    <AppButton className={styles.button} variant="destructive" onClick={handleDeleteProject}>Delete</AppButton>
                </div>
            </div>
        </Modal>
    );
}
