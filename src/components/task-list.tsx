"use client"

import { useRef, useEffect, useState } from 'react';
import { TaskCard } from '@/components/task-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader } from '@/components/ui/card';
import { TaskList, Task } from '@/types/task';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import {
  draggable,
  dropTargetForElements
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

interface TaskListComponentProps {
  list: TaskList;
  index: number;
  onAddTask: (listId: string, content: string) => void;
  onDragStart: (taskId: string, sourceListId: string) => void;
  onTaskDragEnd: () => void;
  onListDragStart: (listId: string) => void;
  onListDragEnd: () => void;
  onTaskDropped?: (taskId: string, sourceListId: string, targetListId: string) => void;
}

export function TaskListComponent({
  list,
  index,
  onAddTask,
  onDragStart,
  onTaskDragEnd,
  onListDragStart,
  onListDragEnd,
  onTaskDropped,
}: TaskListComponentProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle adding a new task
  const handleAddTask = () => {
    if (newTaskContent.trim()) {
      onAddTask(list.id, newTaskContent);
      setNewTaskContent('');
      setIsAdding(false);
    }
  };

  // Setup drag and drop for the list
  useEffect(() => {
    const element = listRef.current;
    if (!element) return;

    // Make the list a drop target for cards
    const dropTarget = dropTargetForElements({
      element: element,
      getData: () => ({
        type: 'list',
        id: list.id,
      }),
      onDrop: (args) => {
        if (args.source.data && typeof args.source.data === 'object' && 'type' in args.source.data) {
          const sourceData = args.source.data as { type: string; id: string; listId: string };
          if (sourceData.type === 'task' && sourceData.id && sourceData.listId) {
            // Call the parent function to handle task drop
            onTaskDropped?.(sourceData.id, sourceData.listId, list.id);
          }
        }
      }
    });

    // Make the list itself draggable
    const draggableList = draggable({
      element: element,
      getInitialData: () => ({
        type: 'list',
        id: list.id,
        index: index,
      }),
      onDragStart: () => {
        setIsDragging(true);
        onListDragStart(list.id);
        
        // Add styling for drag effect
        element.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.2)';
        element.style.opacity = '0.9';
        element.style.zIndex = '100';
      },
      onDrop: () => {
        setIsDragging(false);
        onListDragEnd();
        
        // Remove styling
        element.style.boxShadow = '';
        element.style.opacity = '';
        element.style.zIndex = '';
      }
    });

    return () => {
      dropTarget();
      draggableList();
    };
  }, [list.id, index, onListDragStart, onListDragEnd]);

  return (
    <div 
      ref={listRef}
      className={`w-72 shrink-0 task-list snap-center ${isDragging ? 'list-dragging' : ''}`}
      data-list-id={list.id}
    >
      <Card className="bg-muted/40 max-h-[calc(100vh-180px)] flex flex-col">
        <CardHeader className="p-3 pb-2 cursor-grab" data-drag-handle="true">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-sm">
              {list.title} {list.tasks && <span className="text-muted-foreground ml-1">({list.tasks.length})</span>}
            </h3>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <div className="px-2 pb-2 min-h-[50px] overflow-y-auto flex-grow">
          {list.tasks?.map((task, taskIndex) => (
            <TaskCard
              key={task.id}
              task={task}
              listId={list.id}
              index={taskIndex}
              onDragStart={onDragStart}
              onDragEnd={onTaskDragEnd}
            />
          ))}

          {isAdding ? (
            <div className="p-1">
              <Input
                autoFocus
                value={newTaskContent}
                onChange={(e) => setNewTaskContent(e.target.value)}
                placeholder="Enter task title..."
                className="mb-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTask();
                  if (e.key === 'Escape') setIsAdding(false);
                }}
              />
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  onClick={handleAddTask}
                  disabled={!newTaskContent.trim()}
                >
                  Add
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="flex w-full justify-start text-muted-foreground"
              onClick={() => setIsAdding(true)}
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add a card
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
