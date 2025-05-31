"use client";


import { TBoard, TColumn, TCard } from '@/utils/data';
import { noop } from '@tanstack/react-query';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useProject } from '@/hooks/queries/use-projects';
import initBoardData from "@/models/board.json";

export type BoardContextType = {
  board: TBoard;
  setBoard: React.Dispatch<React.SetStateAction<TBoard>>;
  moveCard: (id: string, targetColumnId: string, targetPosition: number) => void;
  addList: (name: string) => void;
  addCard: (columnId: string, title: string) => void;
  deleteList: (columnId: string) => void;
  updateCardDescription: (cardId: string, description: string) => void;
  updateCardTitle: (cardId: string, title: string) => Promise<void>;
  isLoading?: boolean;
};

const initialContextData: BoardContextType = {
  board: {id: '', title: '', columns: []},
  setBoard: () => { },
  moveCard: noop,
  addList: noop,
  addCard: noop,
  deleteList: noop,
  updateCardDescription: noop,
  updateCardTitle: async () => { },
  isLoading: false,
}

// Create the context with default values
const BoardContext = createContext<BoardContextType>(initialContextData);

// Hook to use the board context
export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardContext must be used within a BoardContextProvider');
  }
  return context;
};

// Props for the BoardContextProvider
type BoardContextProviderProps = {
  children: ReactNode;
  projectId?: string;
};

// create the BoardContextProvider component
export const BoardContextProvider = ({ children, projectId }: BoardContextProviderProps) => {
  const [board, setBoard] = useState<TBoard>(initBoardData);

  // Fetch project data if projectId is provided
  const { 
    data: project, 
    isLoading: projectLoading 
  } = useProject({ 
    id: projectId || '', 
    enabled: !!projectId 
  });

  // Transform project data to board format when project loads
  useEffect(() => {
    if (project && !projectLoading) {
      // Create a map of tasks by column ID for efficient lookup
      const tasksByColumn = new Map<string, typeof project.tasks>();
      
      if (project.tasks) {
        project.tasks.forEach(task => {
          const columnTasks = tasksByColumn.get(task.columnId) || [];
          columnTasks.push(task);
          tasksByColumn.set(task.columnId, columnTasks);
        });
      }

      const boardData: TBoard = {
        id: project.id,
        title: project.title,
        columns: project.columns?.map(col => ({
          id: col.id,
          title: col.title,
          cards: (tasksByColumn.get(col.id) || [])
            .sort((a, b) => a.order - b.order)
            .map(task => ({
              id: task.id,
              title: task.title,
              description: task.description || '',
            }))
        })) || []
      };
      setBoard(boardData);
    }
  }, [project, projectLoading]);

  const moveCard = useCallback((cardId: string, targetColumnId: string, targetPosition: number) => {
    setBoard((prevBoard: TBoard) => {
      const newBoard = JSON.parse(JSON.stringify(prevBoard));

      // Find the card and its current column
      let sourceColumn: TColumn | undefined;
      let card: TCard | undefined;
      let sourceCardIndex: number = -1;
      
      for (const column of newBoard.columns) {
        sourceCardIndex = column.cards.findIndex((c: TCard) => c.id === cardId);
        if (sourceCardIndex !== -1) {
          sourceColumn = column;
          card = column.cards[sourceCardIndex];
          break;
        }
      }

      if (!sourceColumn || !card) {
        console.error("Card not found");
        return prevBoard;
      }

      // Find the target column
      const targetColumn = newBoard.columns.find(
        (col: TColumn) => col.id === targetColumnId
      );

      if (!targetColumn) {
        console.error("Target column not found");
        return prevBoard;
      }

      // Remove the card from its current column
      sourceColumn.cards.splice(sourceCardIndex, 1);

      // Determine the insertion index
      let insertIndex: number;
      if (
        targetPosition === -1 ||
        targetPosition >= targetColumn.cards.length
      ) {
        insertIndex = targetColumn.cards.length;
      } else if (targetPosition === 0) {
        insertIndex = 0;
      } else {
        insertIndex = targetPosition;
      }

      // Insert the card at the target position
      targetColumn.cards.splice(insertIndex, 0, {
        ...card,
      });

      return newBoard;
    });
  },
    [setBoard]
  );

  const addList = useCallback((name: string) => {
    setBoard(prevBoard => {
      const newBoard = JSON.parse(JSON.stringify(prevBoard));
      const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const newColumn: TColumn = {
        id: newId,
        title: name,
        cards: [],
        // position: newBoard.columns.length,
      };
      newBoard.columns.push(newColumn);
      return newBoard;
    },);
  }, [setBoard]);

  const addCard = useCallback((columnId: string, title: string) => {
    setBoard(prevBoard => {
      try {
        const newBoard = JSON.parse(JSON.stringify(prevBoard));
        const column = newBoard.columns.find((col: TColumn) => col.id === columnId);
        if (!column) {
          console.error(`addCard: Column not found for id ${columnId}`); // Generated by Copilot
          return prevBoard;
        }
        const newCard: TCard = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          title,
          description: '',
        };
        column.cards.push(newCard);
        return newBoard;
      } catch (error) {
        console.error('addCard error:', error); // Generated by Copilot
        return prevBoard;
      }
    });
  }, [setBoard]);

  const deleteList = useCallback((columnId: string) => {
    setBoard(prevBoard => {
      try {
        const newBoard = JSON.parse(JSON.stringify(prevBoard));
        newBoard.columns = newBoard.columns.filter((col: TColumn) => col.id !== columnId);
        return newBoard;
      } catch (error) {
        console.error('deleteList error:', error);
        return prevBoard;
      }
    });
  }, [setBoard]);

  const updateCardDescription = useCallback((cardId: string, description: string) => {
    setBoard(prevBoard => {
      try {
        const newBoard = JSON.parse(JSON.stringify(prevBoard));

        // Find the card in the columns
        for (const column of newBoard.columns) {
          const cardIndex = column.cards.findIndex((card: TCard) => card.id === cardId);
          if (cardIndex !== -1) {
            column.cards[cardIndex].description = description;
            return newBoard;
          }
        }

        console.error(`Card with ID ${cardId} not found`);
        return prevBoard;
      } catch (error) {
        console.error('updateCardDescription error:', error);
        return prevBoard;
      }
    });
  }, [setBoard]);

  const updateCardTitle = useCallback(async (cardId: string, title: string) => {
    return new Promise<void>((resolve, reject) => {
      try {
        setBoard(prevBoard => {
          const newBoard = JSON.parse(JSON.stringify(prevBoard));

          // Find the card in the columns
          for (const column of newBoard.columns) {
            const cardIndex = column.cards.findIndex((card: TCard) => card.id === cardId);
            if (cardIndex !== -1) {
              column.cards[cardIndex].title = title;
              setTimeout(() => resolve(), 0); // Resolve promise after state update
              return newBoard;
            }
          }

          console.error(`Card with ID ${cardId} not found`);
          reject(new Error(`Card with ID ${cardId} not found`));
          return prevBoard;
        });
      } catch (error) {
        console.error('updateCardTitle error:', error);
        reject(error);
      }
    });
  }, [setBoard]);

  return (
    <BoardContext.Provider value={{ board, setBoard, moveCard, addList, addCard, deleteList, updateCardDescription, updateCardTitle, isLoading: projectLoading }}>
      {children}
    </BoardContext.Provider>
  );
};
