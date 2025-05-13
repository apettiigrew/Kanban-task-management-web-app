import React from 'react';
import styles from './Column.module.scss';
import { TaskCard } from '../task/task-card';
import { Task, Task as TaskType } from '../../context/BoardContext';

interface ColumnProps {
    title: string;
    tasks?: Task[];
    column?: TaskType[];
}

const Column: React.FC<ColumnProps> = ({ title, tasks = [], column = [] }) => {
    // Support both direct tasks array and column data from context
    const tasksToRender = tasks.length > 0 ? tasks : column.map(task => task);
    
    return (
        <div className={styles.column}>
            <h2>{title}</h2>
            <div className={styles.tasks}>
                {tasksToRender.map((task, index) => (
                    <TaskCard task={task} key={index}/>
                ))}
            </div>            
        </div>
    );
};

export default Column;
