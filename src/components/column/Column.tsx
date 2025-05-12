import React from 'react';
import styles from './Column.module.scss';
import Task from '../task/Task';

interface ColumnProps {
    title: string;
    tasks: string[];
}

const Column: React.FC<ColumnProps> = ({ title, tasks }) => {
    return (
        <div className={styles.column}>
            <h2>{title}</h2>
            <div className={styles.tasks}>
                {tasks.map((task, index) => (
                    <Task key={index} title={task} />
                ))}
            </div>
        </div>
    );
};

export default Column;
