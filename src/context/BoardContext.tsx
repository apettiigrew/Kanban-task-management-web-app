"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the task type
export type Task = {
  id: number;
  title: string;
  description: string;
};

// Define the columns structure
export type ColumnMap = {
  [key: string]: Task[];
};

// Define the context value type
export type BoardContextType = {
  columnMap: ColumnMap;
  orderedColumnIds: string[];
};

// Create the context with default values
const BoardContext = createContext<BoardContextType | undefined>(undefined);

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
  initialData?: BoardContextType;
};

// Initial default data
const defaultBoardData: BoardContextType = {
  columnMap: {
    TODO: [
      { id: 1, title: "Build UI for onboarding flow", description: "Create the user interface for the onboarding process." },
      { id: 2, title: "Build UI for search", description: "Develop the search functionality UI." },
      { id: 3, title: "Build settings UI", description: "Design and implement the settings page UI." },
      { id: 4, title: "QA and test all major user journeys", description: "Perform quality assurance and testing for all key user flows." }
    ],
    DOING: [
      { id: 5, title: "Design settings and search pages", description: "Create designs for the settings and search pages." },
      { id: 6, title: "Add account management endpoints", description: "Implement backend endpoints for account management." },
      { id: 7, title: "Design onboarding flow", description: "Plan and design the onboarding process." },
      { id: 8, title: "Add search endpoints", description: "Develop backend endpoints for search functionality." },
      { id: 9, title: "Add authentication endpoints", description: "Implement authentication-related backend endpoints." },
      { id: 10, title: "Research pricing points of various competitors and trial different business models", description: "Analyze competitor pricing and experiment with business models." }
    ],
    DONE: [
      { id: 11, title: "Conduct 5 wireframe tests", description: "Perform usability tests on five wireframes." },
      { id: 12, title: "Create wireframe prototype", description: "Build a prototype using wireframes." },
      { id: 13, title: "Review results of usability tests and iterate", description: "Analyze usability test results and make improvements." },
      { id: 14, title: "Create paper prototypes and conduct 10 usability tests with potential customers", description: "Develop paper prototypes and test them with users." },
      { id: 15, title: "Market discovery", description: "Research and analyze the target market." },
      { id: 16, title: "Competitor analysis", description: "Study competitors to identify strengths and weaknesses." },
      { id: 17, title: "Research the market", description: "Conduct in-depth market research." }
    ]
  },
  orderedColumnIds: ['TODO', 'DOING', 'DONE']
};

// Create the BoardContextProvider component
export const BoardContextProvider = ({ 
  children, 
  initialData = defaultBoardData 
}: BoardContextProviderProps) => {
  const [boardData, ] = useState<BoardContextType>(initialData);

  const contextValue = {
    ...boardData,
  };

  return (
    <BoardContext.Provider value={contextValue}>
      {children}
    </BoardContext.Provider>
  );
};
