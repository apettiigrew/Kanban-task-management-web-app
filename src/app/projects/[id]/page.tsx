import ProjectKanbanBoard from '../../components/ProjectKanbanBoard';
import { getProject } from '../../actions/project';
import styles from './ProjectPage.module.css';

interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { project } = await getProject(id) as { project?: Project };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{project?.title || 'Project'}</h1>
        {project && project.description && <p className={styles.description}>{project.description}</p>}
      </div>
      <div className={styles.content}>
        {/* Kanban board for this project */}
        <ProjectKanbanBoard projectId={id} />
      </div>
    </div>
  );
} 