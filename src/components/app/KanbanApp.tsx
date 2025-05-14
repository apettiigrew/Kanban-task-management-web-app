import React from 'react';
import { BoardContextProvider } from '../../providers/board-context-provider';
import Board from '../board/Board';

/**
 * KanbanApp component that wraps the Board with the BoardContextProvider
 * This demonstrates the simplest way to use the board with context
 */
const KanbanApp: React.FC = () => {
  return (
    <BoardContextProvider>
      <Board />
    </BoardContextProvider>
  );
};

export default KanbanApp;
