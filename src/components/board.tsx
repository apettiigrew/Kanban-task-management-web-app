"use client"

import { useState, useEffect, useRef } from 'react';
import { TaskList as TaskListType, Task, Board as BoardType } from '@/types/task';
import { TaskListComponent } from '@/components/task-list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import '@/app/board.css';

interface BoardProps {
  boardId: string | number;
  initialData?: BoardType;
}

export function Board({ boardId, initialData }: BoardProps) {
  // Mock data if no initialData is provided
  const defaultBoard: BoardType = {
    id: String(boardId),
    title: 'Project Board',
    lists: [
      {
        id: 'list-1',
        title: 'To Do',
        tasks: [
          { id: 'task-1', content: 'Research competitors', description: 'Look into what others are doing', labels: ['research'] },
          { id: 'task-2', content: 'Wireframing', description: 'Create initial wireframes', labels: ['design'] },
        ],
      },
      {
        id: 'list-2',
        title: 'In Progress',
        tasks: [
          { id: 'task-3', content: 'User authentication', description: 'Implement login and signup', labels: ['frontend', 'backend'] },
        ],
      },
      {
        id: 'list-3',
        title: 'Done',
        tasks: [
          { id: 'task-4', content: 'Project setup', dueDate: '2025-05-15', labels: ['setup'] },
        ],
      },
    ],
  };

  const [board, setBoard] = useState<BoardType>(initialData || defaultBoard);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [currentDragInfo, setCurrentDragInfo] = useState<{
    taskId?: string;
    sourceListId?: string;
    listId?: string;
  } | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);

  // Setup board drop targets
  useEffect(() => {
    const element = boardRef.current;
    if (!element) return;

    // Make the board a drop target for both lists and tasks
    const dropTarget = dropTargetForElements({
      element,
      getData: () => ({
        type: 'board',
        id: board.id,
      })
    });

    // Simple event handling for drop styling
    const handleDragStart = () => {
      element.classList.add('bg-muted/30');
    };

    const handleDrop = () => {
      element.classList.remove('bg-muted/30');
      
      // Process the drop if we have currentDragInfo
      if (currentDragInfo && currentDragInfo.taskId && currentDragInfo.sourceListId) {
        // The specific list will handle its own drop target
        // We're just using this info for visual feedback
      }
    };

    // Add basic event listeners
    element.addEventListener('dragover', handleDragStart);
    element.addEventListener('drop', handleDrop);
    element.addEventListener('dragleave', () => element.classList.remove('bg-muted/30'));

    return () => {
      dropTarget();
      element.removeEventListener('dragover', handleDragStart);
      element.removeEventListener('drop', handleDrop);
      element.removeEventListener('dragleave', () => element.classList.remove('bg-muted/30'));
    };
  }, [board.id, currentDragInfo]);

  // Add a new list
  const handleAddList = () => {
    if (newListTitle.trim()) {
      const newList: TaskListType = {
        id: `list-${Date.now()}`,
        title: newListTitle.trim(),
        tasks: [],
      };

      setBoard({
        ...board,
        lists: [...board.lists, newList],
      });

      setNewListTitle('');
      setIsAddingList(false);
    }
  };

  // Add a task to a list
  const handleAddTask = (listId: string, content: string) => {
    try {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        content: content.trim(),
      };

      setBoard({
        ...board,
        lists: board.lists.map(list => {
          if (list.id === listId) {
            return {
              ...list,
              tasks: [...list.tasks, newTask],
            };
          }
          return list;
        }),
      });
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Handle moving a task between lists
  const handleMoveTask = (taskId: string, sourceListId: string, targetListId: string) => {
    try {
      if (sourceListId === targetListId) return; // No change needed
      
      // Find the task to move
      const sourceList = board.lists.find(l => l.id === sourceListId);
      if (!sourceList) return;

      const taskToMove = sourceList.tasks.find(t => t.id === taskId);
      if (!taskToMove) return;

      // Create new lists array with the task moved
      const newLists = board.lists.map(list => {
        // Remove from source list
        if (list.id === sourceListId) {
          return {
            ...list,
            tasks: list.tasks.filter(t => t.id !== taskId),
          };
        }
        // Add to target list
        if (list.id === targetListId) {
          return {
            ...list,
            tasks: [...list.tasks, taskToMove],
          };
        }
        return list;
      });

      // Update board state
      setBoard({
        ...board,
        lists: newLists,
      });
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  // Handle reordering lists 
  const handleReorderLists = (listId: string, newIndex: number) => {
    try {
      // Find the current index of the list
      const currentIndex = board.lists.findIndex(list => list.id === listId);
      if (currentIndex === -1 || currentIndex === newIndex) return;

      // Create a new array of lists with the moved list at the new index
      const newLists = [...board.lists];
      const [removedList] = newLists.splice(currentIndex, 1);
      newLists.splice(newIndex, 0, removedList);

      // Update the board with the new list order
      setBoard({
        ...board,
        lists: newLists,
      });
    } catch (error) {
      console.error('Error reordering lists:', error);
    }
  };

  // Track drag start for tasks
  const handleTaskDragStart = (taskId: string, sourceListId: string) => {
    setCurrentDragInfo({ taskId, sourceListId });
  };

  // Track drag start for lists
  const handleListDragStart = (listId: string) => {
    setCurrentDragInfo({ listId });
  };

  // Clear drag tracking on drag end
  const handleDragEnd = () => {
    // If we have task and source info, and the drop was on a different list
    // We need to handle the task movement
    if (currentDragInfo?.taskId && currentDragInfo?.sourceListId) {
      // The actual move is handled by the receiving list
      // through its dropTargetForElements handler
    }
    
    setCurrentDragInfo(null);
  };
  
  // Function to handle task drop on a list
  const handleTaskDroppedOnList = (taskId: string, sourceListId: string, targetListId: string) => {
    handleMoveTask(taskId, sourceListId, targetListId);
  };

  return (
    <div 
      ref={boardRef}
      className="min-h-screen bg-background pt-6 pb-16 transition-colors"
    >
      <div className="px-6">
        <h1 className="text-3xl font-bold mb-6">{board.title}</h1>
        
        <div className="flex items-start gap-4 overflow-x-auto pb-8 min-h-[calc(100vh-200px)] snap-x snap-mandatory">
          {board.lists.map((list, index) => (
            <TaskListComponent
              key={list.id}
              list={list}
              index={index}
              onAddTask={handleAddTask}
              onDragStart={handleTaskDragStart}
              onTaskDragEnd={handleDragEnd}
              onListDragStart={handleListDragStart}
              onListDragEnd={handleDragEnd}
              onTaskDropped={handleTaskDroppedOnList}
            />
          ))}
          
          {isAddingList ? (
            <div className="w-72 shrink-0 bg-muted/40 p-2 rounded-md">
              <Input
                autoFocus
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="Enter list title..."
                className="mb-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddList();
                  if (e.key === 'Escape') setIsAddingList(false);
                }}
              />
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  onClick={handleAddList}
                  disabled={!newListTitle.trim()}
                >
                  Add List
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsAddingList(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="shrink-0">
              <Button
                variant="outline"
                className="border-dashed border-2 h-10 w-72 justify-start"
                onClick={() => setIsAddingList(true)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add another list
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
