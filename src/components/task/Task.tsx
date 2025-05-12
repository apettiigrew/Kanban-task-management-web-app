import React from 'react';
import styles from './Task.module.scss';

interface TaskProps {
    title: string;
}

const Task: React.FC<TaskProps> = ({ title }) => {
    return (
        <div className={styles.task}>
            {title}
        </div>
    );
};

export default Task;
