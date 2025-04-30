"use client";

import { useState, useEffect, useCallback } from 'react';
import { getTasksByProject, updateTask } from '@/features/project/actions/task';
import TaskModal from '../modals/task/create/TaskModal';
import DeleteTaskModal from '../modals/task/delete/DeleteTaskModal';
import styles from './ProjectKanbanBoard.module.css';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  createdAt: string;
}

interface ProjectKanbanBoardProps {
  projectId: string;
}

const STATUS_COLUMNS = [
  { key: 'todo', label: 'TODO' },
  { key: 'doing', label: 'DOING' },
  { key: 'done', label: 'DONE' },
];

export default function ProjectKanbanBoard({ projectId }: ProjectKanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const { tasks: fetchedTasks = [] } = await getTasksByProject(projectId);
      setTasks(fetchedTasks as Task[]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const openCreateTaskModal = () => {
    setSelectedTask(null);
    setModalType('create');
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setSelectedTask(task);
    setModalType('edit');
    setIsTaskModalOpen(true);
  };

  const openDeleteTaskModal = (task: Task) => {
    setSelectedTask(task);
    setModalType('delete');
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
    setModalType(null);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;

    const task = tasks.find((t) => t.id == draggableId);
    
    if (!task) return;
    
    console.log("destination", destination);
    // Create new task array with updated status
    const updatedTasks = tasks.map(t => 
      t.id == draggableId 
        ? { ...t, status: destination.droppableId as 'todo' | 'doing' | 'done' }
        : t
    );

    console.log("updatedTasks", updatedTasks);
    // Update UI immediately
    setTasks(updatedTasks);

   
    // Update backend
    const formData = new FormData();
    formData.append('id', task.id);
    formData.append('projectId', projectId);
    formData.append('status', destination.droppableId);
    formData.append('title', task.title);
    formData.append('description', task.description || '');

    try {
      await updateTask(null, formData);
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert to original state if update fails
      setTasks(tasks);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading tasks...</div>;
  }

  return (
    <div className={styles.kanbanBoard}>
      <div className={styles.boardHeader}>
        <h2 className={styles.boardTitle}>Tasks</h2>
        <button className={styles.addTaskButton} onClick={openCreateTaskModal}>
          + Add Task
        </button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={styles.columns}>
          {STATUS_COLUMNS.map((col) => (
            <Droppable droppableId={col.key} key={col.key}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={
                    snapshot.isDraggingOver
                      ? `${styles.column} ${styles.isDraggingOver}`
                      : styles.column
                  }
                >
                  <div className={styles.columnHeader}>
                    <span className={styles.columnDot} data-status={col.key}></span>
                    <span className={styles.columnTitle}>
                      {col.label} ({tasks.filter((t) => t.status === col.key).length})
                    </span>
                  </div>
                  <div className={styles.taskList}>
                    {tasks
                      .filter((t) => t.status === col.key)
                      .map((task, idx) => (
                        <Draggable key={task.id} draggableId={task.id+""} index={idx}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => openEditTaskModal(task)}
                              className={`${styles.taskCard} ${snapshot.isDragging ? styles.isDragging : ''}`}
                            >
                              <div className={styles.taskTitle}>{task.title}</div>
                              <div className={styles.taskDescription}>{task.description}</div>
                              <div className={styles.taskActions}>
                                <button onClick={() => openEditTaskModal(task)} className={styles.editButton}>Edit</button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteTaskModal(task);
                                  }} 
                                  className={styles.deleteButton}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
     
      {isTaskModalOpen && (modalType === 'create' || modalType === 'edit') && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={closeTaskModal}
          onTaskSaved={() => {
            closeTaskModal();
            fetchTasks();
          }}
          projectId={projectId}
          task={modalType === 'edit' ? selectedTask ?? undefined : undefined}
        />
      )}
      {isTaskModalOpen && modalType === 'delete' && selectedTask && (
        <DeleteTaskModal
          isOpen={isTaskModalOpen}
          onClose={closeTaskModal}
          onTaskDeleted={() => {
            closeTaskModal();
            fetchTasks();
          }}
          projectId={projectId}
          task={selectedTask}
        />
      )}
    </div>
  );
} 