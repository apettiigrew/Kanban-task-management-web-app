import React, { useState } from 'react';
import styles from './sidebar.module.scss';
import { AddIcon, EyeIcon } from '../icons/icons';
import { AppButtonWithIcon } from '../button/AppButton';
import { AddProjectModal } from '../modals/add-project-modal';

interface Board {
  name: string;
  active: boolean;
  description?: string;
}

interface SidebarProps {
  collapsed: boolean;
  onShowSidebar: () => void;
  onHideSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onShowSidebar, onHideSidebar }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [boards, setBoards] = useState<Board[]>([
    { name: 'Platform Launch', active: true },
    { name: 'Marketing Plan', active: false },
    { name: 'Roadmap', active: false },
  ]);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  
  const handleBoardClick = (boardName: string) => {
    const newBoards = boards.map(board => ({
      ...board,
      active: board.name === boardName
    }));
    setBoards(newBoards);
  };

  if (collapsed) {
    return (
      <button className={styles.showSidebar} onClick={onShowSidebar}>
        <EyeIcon />
      </button>
    );
  }
  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.bars}>
            <span className={styles.bar} />
            <span className={styles.bar} />
            <span className={styles.bar} />
          </span>
          <span className={styles.appName}>kanban</span>
        </div>
        <div className={styles.boardsSection}>
          <div className={styles.boardsLabel}>
            <p>ALL BOARDS</p>
          </div>
          <ul className={styles.boardList}>
            <li>
              <AppButtonWithIcon icon={<AddIcon />} onClick={handleOpenModal}>
                Create New Board
              </AppButtonWithIcon>
            </li>
          </ul>
        </div>
        <div className={styles.bottomSection}>
          <button className={styles.hideSidebar} onClick={onHideSidebar}>
            <span role="img" aria-label="hide">👁️‍🗨️</span> Hide Sidebar
          </button>
        </div>
      </aside>
      <AddProjectModal isOpen={modalOpen} onClose={handleCloseModal} onSuccess={()=>{
        setModalOpen(false);
      }} />
    </>
  );
};