'use client';

import { useContext } from "react";

import { DesktopHeader } from "@/components/header/desktop-header";
import { MobileHeader } from "@/components/header/mobile-header";
import { Sidebar } from "@/components/sidebar/sidebar";
import { useDebounce } from '@/hooks/useDebounce';
import { useProjectsQuery } from '@/hooks/useProjects';
import { BreakpointPlatform } from "@/models/css-vars";
import { DeviceInfoContext } from "@/providers/device-info-provider";
import { ChangeEvent, useMemo, useState } from "react";
import styles from "./page.module.scss";


export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'desc' | 'asc'>('desc');

  const deviceInfoContext = useContext(DeviceInfoContext);
  const showMobileCards = deviceInfoContext.breakPoint === BreakpointPlatform.phone;

  // Fetch projects
  const { data: projects, isLoading, isError } = useProjectsQuery();

  // Debounced search value
  const debouncedSearch = useDebounce(search, 300);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    let filtered = projects;
    if (debouncedSearch) {
      filtered = filtered.filter(p => p.title.toLowerCase().includes(debouncedSearch.toLowerCase()));
    }
    filtered = filtered.sort((a, b) => {
      if (sort === 'desc') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
    });
    return filtered;
  }, [projects, debouncedSearch, sort]);

  // ProjectCard component
  function ProjectCard({ project }: { project: any }) {
    return (
      <div className={styles.projectCard}>
        <div className={styles.projectCardHeader}>{project.title}</div>
        <div className={styles.projectCardDesc}>{project.description}</div>
      </div>
    );
  }

  // ProjectGrid component
  function ProjectGrid() {
    if (isLoading) return <div>Loading projects...</div>;
    if (isError) return <div>Failed to load projects.</div>;
    if (!filteredProjects.length) return <div>No projects found.</div>;
    return (
      <div className={styles.projectsGrid}>
        {filteredProjects.map(project => (
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
              <select id="sort" value={sort} onChange={e => setSort(e.target.value as 'desc' | 'asc')}>
                <option value="desc">Most recently active</option>
                <option value="asc">Oldest first</option>
              </select>
            </div>
            <div>
              <label htmlFor="search" className={styles.searchLabel}>Search</label>
              <input
                id="search"
                type="text"
                placeholder="Search boards"
                value={search}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
          <h2 style={{ marginTop: 32, marginBottom: 0 }}>Boards</h2>
          <ProjectGrid />
        </div>
      </div>
    </main>
  );
}
