"use client"

import { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types/task";
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

interface TaskCardProps {
  task: Task;
  listId: string;
  index: number;
  onDragStart: (taskId: string, listId: string) => void;
  onDragEnd: () => void;
}

export function TaskCard({ task, listId, index, onDragStart, onDragEnd }: TaskCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Set up drag and drop for the card
  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const cleanup = draggable({
      element,
      getInitialData: () => ({
        type: 'task',
        id: task.id,
        listId: listId,
        index: index,
      }),
      onDragStart: () => {
        setIsDragging(true);
        onDragStart(task.id, listId);
        
        // Add styling for drag effect
        element.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.15)';
        element.style.opacity = '0.9';
        element.style.zIndex = '50';
      },
      onDrop: () => {
        setIsDragging(false);
        onDragEnd();
        
        // Remove styling
        element.style.boxShadow = '';
        element.style.opacity = '';
        element.style.zIndex = '';
      },
    });

    return cleanup;
  }, [task.id, listId, index, onDragStart, onDragEnd]);

  return (
    <div
      ref={cardRef}
      className={`mb-2 cursor-grab task-card ${
        isDragging ? 'task-dragging' : ''
      }`}
      data-task-id={task.id}
    >
      <Card className="p-0 hover:bg-muted/30 border shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-3">
          {task.labels && task.labels.length > 0 && (
            <div className="flex gap-1 mb-2">
              {task.labels.map((label, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className={`h-1.5 w-8 p-0 ${
                    label === 'research' ? 'bg-blue-500' : 
                    label === 'design' ? 'bg-purple-500' : 
                    label === 'frontend' ? 'bg-green-500' : 
                    label === 'backend' ? 'bg-amber-500' : 
                    label === 'setup' ? 'bg-slate-500' : 'bg-gray-500'
                  }`}
                />
              ))}
            </div>
          )}
          <div className="text-sm font-medium">{task.content}</div>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {task.description}
            </p>
          )}
          {task.dueDate && (
            <div className="flex items-center mt-2">
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
