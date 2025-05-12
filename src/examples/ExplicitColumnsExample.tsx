import React from 'react';
import { BoardContextProvider, useBoardContext } from '../context/BoardContext';
import Board from '../components/board/Board';
import Column from '../components/column/Column';

// Component that consumes the BoardContext inside the provider
const ColumnsFromContext = () => {
  const { orderedColumnIds, columnMap } = useBoardContext();
  
  return (
    <Board>
      {orderedColumnIds.map((columnId: string) => (
        <Column 
          key={columnId}
          title={columnId}
          column={columnMap[columnId]}
        />
      ))}
    </Board>
  );
};

/**
 * Example showing how to use the Board with explicit Column components
 * that get their data from the BoardContext
 */
const ExplicitColumnsExample: React.FC = () => {
  return (
    <BoardContextProvider>
      <ColumnsFromContext />
    </BoardContextProvider>
  );
};

export default ExplicitColumnsExample;
