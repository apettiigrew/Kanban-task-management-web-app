import React, { useEffect, useRef } from 'react';
import styles from './task-card.module.scss';
import {
    draggable
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Task } from '@/context/BoardContext';
import { cc, classIf } from '@/utils/style-utils';
interface TaskProps {
    task: Task;
}

type State =
    | { type: 'idle' }
    | { type: 'preview'; container: HTMLElement; rect: DOMRect }
    | { type: 'dragging' };

const draggingState: State = { type: 'idle' };
export function TaskCard(props: TaskProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const { task: { id, title } } = props;

    const [isDragging, setIsDragging] = React.useState<State>(draggingState);
    useEffect(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        return draggable({
            element,
            onDragStart: () => {
                setIsDragging({ type: 'dragging' });
            },
            onDrop: () => {
                setIsDragging({ type: 'idle' });
            }
        });
    }, []);

    return (
        <div
            data-test-id={id}
            ref={ref}
            className={cc(styles.task, classIf(isDragging.type === 'dragging', styles.dragging))}>
            {title}
        </div>
    );
};
