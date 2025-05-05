'use client';

import React, { useState } from 'react';
import { AppButton } from '@/components/AppButton';
import { AddIcon } from '@/components/AddIcon';
import styles from './page.module.scss';
import Heading from '@/components/Heading';
import Header from '@/components/Header';
import AddProjectModal from '@/components/AddProjectModal';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleAddProject = (title: string) => {
    alert(`Project added: ${title}`); // Replace with real logic
  };

  return (
    <main className={styles.main}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onShowSidebar={() => setSidebarCollapsed(false)}
        onHideSidebar={() => setSidebarCollapsed(true)}
      />
      <div className={styles.container}>
        <div className={styles.header}>
          <Header onAddClick={() => setModalOpen(true)} />
          <AddProjectModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={handleAddProject}
          />
        </div>
        <div>
          <div className={styles.message}>
            This board is empty. Create a new column to get started.
          </div>
          <AppButton variant="primary" size="large">
            <AddIcon style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Add New Column
          </AppButton>
        </div>
      </div>
    </main>
  );
}
