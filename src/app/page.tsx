'use client';

import { useContext } from "react";

import { DeviceInfoContext } from "@/providers/device-info-provider";
import { useState } from "react";
import { BreakpointPlatform } from "@/models/css-vars";
import { Sidebar } from "@/components/sidebar/sidebar";
import { MobileHeader } from "@/components/header/mobile-header";
import { DesktopHeader } from "@/components/header/desktop-header";
import styles from "./page.module.scss";
import { AddProjectModal } from "@/components/modals/add-project-modal";

        
export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);              
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


  const deviceInfoContext = useContext(DeviceInfoContext);
  
  const handleAddProject = (title: string) => {
    alert(`Project added: ${title}`); // Replace with real logic
  };

  const showMobileCards = deviceInfoContext.breakPoint === BreakpointPlatform.phone;

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
          <AddProjectModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={handleAddProject}
          />
        </div>
        {/* <div>
          <div className={styles.message}>
            This board is empty. Create a new column to get started.
          </div>
          <AppButton variant="primary" size="large">
            <AddIcon style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Add New Column
          </AppButton>
        </div> */}
      </div>
    </main>
  );
}
