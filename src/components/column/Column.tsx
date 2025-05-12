import React from 'react';
import styles from './Column.module.scss';
import Task from '../task/Task';
import { Task as TaskType } from '../../context/BoardContext';

interface ColumnProps {
    title: string;
    tasks?: string[];
    column?: TaskType[];
}

const Column: React.FC<ColumnProps> = ({ title, tasks = [], column = [] }) => {
    // Support both direct tasks array and column data from context
    const tasksToRender = tasks.length > 0 ? tasks : column.map(task => task.title);
    
    return (
        <div className={styles.column}>
            <h2>{title}</h2>
            <div className={styles.tasks}>
                {tasksToRender.map((task, index) => (
                    <Task key={index} title={task} />
                ))}
            </div>
        </div>
    );
};

export default Column;
