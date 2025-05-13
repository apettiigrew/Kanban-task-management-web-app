import React, { useEffect, useRef } from 'react';
import styles from './task-card.module.scss';
import {
    draggable
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Task } from '@/context/BoardContext';
interface TaskProps {
    task: Task;
}

export function TaskCard(props: TaskProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const { task: { id, title } } = props;

    useEffect(() => {
        const element = ref.current;

        if (!element) {
            return; // Return undefined instead of null for early exit
        }

        return draggable({
            element,
        });
    }, []);

    return (
        <div
            data-test-id={id}
            ref={ref}
            className={styles.task}>
            {title} 
        </div>
    );
};
