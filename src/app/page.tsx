'use client';

import { useContext } from "react";

import { AppInput } from "@/components/input/AppInput";
import { DropdownMenu } from '@/components/dropdown-menu/DropdownMenu';
import { DesktopHeader } from "@/components/header/desktop-header";
import { MobileHeader } from "@/components/header/mobile-header";
import { DeleteIcon, EditIcon, SearchIcon } from "@/components/icons/icons";
import { EditProjectModal } from '@/components/modals/edit-project-modal';
import { Sidebar } from "@/components/sidebar/sidebar";
import { useDebounce } from '@/hooks/useDebounce';
import { Project, useProjectsQuery } from '@/hooks/useProjects';
import { BreakpointPlatform } from "@/models/css-vars";
import { DeviceInfoContext } from "@/providers/device-info-provider";
import { useState } from "react";
import styles from "./page.module.scss";
import { DeleteProjectModal } from "@/components/modals/delete-project-modal";

export default function Home() {
  const [, setModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'desc' | 'asc'>('desc');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const deviceInfoContext = useContext(DeviceInfoContext);
  const showMobileCards = deviceInfoContext.breakPoint === BreakpointPlatform.phone;

  // Debounced search value
  const debouncedSearch = useDebounce(search, 300);

  // Fetch projects (filtered for main page)
  const { data: projects, isLoading, isError } = useProjectsQuery({ search: debouncedSearch, sort });

  // ProjectCard component
  function ProjectCard({ project }: { project: Project }) {
    return (
      <div className={styles.projectCard}>
        <div className={styles.projectCardHeader}>
          {project.title}

          <div className={styles.iconGroups}>
            <button
              className={styles.editButton}
              onClick={(e) => {
                e.stopPropagation();
                setEditingProject(project);
              }}
              aria-label="Edit project"
            >
              <EditIcon />
            </button>
            <button
              className={styles.editButton}
              onClick={(e) => {
                e.stopPropagation();
                setDeletingProject(project);
              }}
              aria-label="Delete project"
            >
              <DeleteIcon />
            </button>
          </div>

        </div>
        <div className={styles.projectCardDesc}>{project.description}</div>
      </div>
    );
  }

  // ProjectGrid component
  function ProjectGrid() {
    if (isLoading) return <div>Loading projects...</div>;
    if (isError) return <div>Failed to load projects.</div>;
    if (!projects || !projects.length) return <div>No projects found.</div>;
    return (
      <div className={styles.projectsGrid}>
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onShowSidebar={() => setSidebarCollapsed(false)}
        onHideSidebar={() => setSidebarCollapsed(true)}
      />
      <div className={styles.container}>
        <div className={styles.header}>
          {showMobileCards ? (
            <MobileHeader onAddClick={() => setModalOpen(true)} />
          ) : (
            <DesktopHeader onAddTask={() => setModalOpen(true)} />
          )}
        </div>
        <div className={styles.content}>
          <div className={styles.filterBar}>
            <div>
              <label htmlFor="sort" className={styles.sortLabel}>Sort by</label>
              <DropdownMenu
                label={sort === 'desc' ? 'Most recently active' : 'Oldest first'}
                items={[
                  {
                    label: 'Most recently active',
                    onClick: () => setSort('desc'),
                    disabled: sort === 'desc',
                  },
                  {
                    label: 'Oldest first',
                    onClick: () => setSort('asc'),
                    disabled: sort === 'asc',
                  },
                ]}
                align="left"
              />
            </div>
            <div>
              <AppInput
                value={search}
                onChange={setSearch}
                placeholder="Search boards"
                className={styles.searchInput}
                id="search"
                wrapperClassName={styles.searchBoxWrapper}
                icon={<SearchIcon />}
              />
            </div>
          </div>
          <h2 style={{ marginTop: 32, marginBottom: 0 }}>Boards</h2>
          <ProjectGrid />
        </div>
      </div>
      {editingProject && (
        <EditProjectModal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          onSuccess={() => setEditingProject(null)}
          project={editingProject}
        />
      )}

      {deletingProject && (
        <DeleteProjectModal
          isOpen={!!deletingProject}
          onClose={() => setDeletingProject(null)}
          onSuccess={() => setDeletingProject(null)}
          project={deletingProject!}
        />
      )}

    </main>
  );
}
