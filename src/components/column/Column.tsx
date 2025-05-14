import { cc, classIf } from '@/utils/style-utils';
import {
    dropTargetForElements
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useEffect, useRef, useState } from 'react';
import { ColumnType } from '../../providers/board-context-provider';
import { TaskCard } from '../task/card';
import styles from './Column.module.scss';
interface ColumnProps {
    name: string;
    column: ColumnType
}

export function Column(props: ColumnProps) {
    const { name, column } = props;
    const [highlight, setHighlight] = useState(false);
    const [isAboutToDrop, setIsAboutToDrop] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const tasksToRender = column.cards.length > 0 ? column.cards : column.cards.map(card => card);

    useEffect(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        return dropTargetForElements({
            element,
            onDrop:() => {
                setIsAboutToDrop(false);
                console.log('Dropped');
            },
            onDragEnter:() => {
                setIsAboutToDrop(true);
                console.log('Drag enter');
            },
            onDragStart:() => {
                setIsAboutToDrop(true);
                console.log('Drag start');
            },
            onDragLeave:() => {
                setIsAboutToDrop(false);
                console.log('Drag leave');
            },
            
        });
    }, [column.id])

    return (
        <div className={cc(styles.column,classIf(isAboutToDrop,styles.dropping))} ref={ref}>
            <h2>{name}</h2>
            <div className={styles.tasks}>
                {tasksToRender.map((task, index) => (
                    <TaskCard card={task} key={index} />
                ))}
            </div>
        </div>
    );
};


