"use client";

import { noop } from '@/utils';
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import initBoardData from "@/models/board.json";
// Define the task type
export type Card = {
  id: string | number;
  title: string;
  description: string;
  position: number;
  columnId: string;
};

// Define the columns structure
export type ColumnMap = {
  [key: string]: Card[];
};

export type ColumnType = {
  id: string;
  name: string;
  cards: Card[];
};

export type Board = {
  name: string;
  columns: ColumnType[];
};

export type BoardContextType = {
  board: Board;
  moveCard: (id: string, targetColumnId: string, targetPosition: number) => void;
};


const initialContextData: BoardContextType = {
  board: { name: "", columns: [] },
  moveCard: noop,
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
};



// Create the BoardContextProvider component
export const BoardContextProvider = ({ children }: BoardContextProviderProps) => {
  const [board, setBoard] = useState<Board>(initBoardData);

  const moveCard = useCallback((cardId: string, targetColumnId: string, targetPosition: number) => {
      setBoard((prevBoard) => {
        const newBoard = JSON.parse(JSON.stringify(prevBoard));

        // Find the card and its current column
        let sourceColumn: ColumnType | undefined;
        let card: Card | undefined;
        let sourceCardIndex: number = -1;

        for (const column of newBoard.columns) {
          sourceCardIndex = column.cards.findIndex((c: Card) => c.id === cardId);
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
          (col: ColumnType) => col.id === targetColumnId
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
          columnId: targetColumnId,
        });

        // Update positions of all cards in the affected columns
        const updatePositions = (column: ColumnType) => {
          column.cards.forEach((c, index) => {
            c.position = index;
          });
        };

        updatePositions(targetColumn);
        if (sourceColumn !== targetColumn) {
          updatePositions(sourceColumn);
        }

        return newBoard;
      });
    },
    [setBoard]
  );

  return (
    <BoardContext.Provider value={{ board, moveCard }}>
      {children}
    </BoardContext.Provider>
  );
};
