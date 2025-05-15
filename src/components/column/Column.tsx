import { cc, classIf } from '@/utils/style-utils';
import {
    monitorForElements,
    dropTargetForElements
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useEffect, useRef, useState } from 'react';
import { Card, ColumnType, useBoardContext } from '../../providers/board-context-provider';
import { CardTask } from '../card/card';
import styles from './Column.module.scss';
import { PlaceholderCard } from '../card/PlaceholderCard';

interface ColumnProps {
    name: string;
    column: ColumnType
}

export function Column(props: ColumnProps) {
    const { name, column } = props;
    const { moveCard } = useBoardContext();
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
            onDrop: () => {
                setIsAboutToDrop(false);
                // console.log('Dropped');
            },
            onDragEnter: () => {
                setIsAboutToDrop(true);
                // console.log('Drag enter');
            },
            onDragStart: () => {
                setIsAboutToDrop(true);
                // console.log('Drag start');
            },
            onDragLeave: () => {
                setIsAboutToDrop(false);
                // console.log('Drag leave');
            },

        });
    }, [column.id])

    useEffect(() => {
        monitorForElements({
            onDrop({ source, location }) {
                const target = location.current.dropTargets[0];

                console.log('Source:', source);
                console.log('Target:', target);
                if (!source || !target) {
                    return;
                }

                const sourceData = source.data as Card;
                const targetData = target.data as Card;

                // console.log('Source data:', sourceData);
                // console.log('Target data:', targetData);
                if (!sourceData || !targetData) {
                    return;
                }

                if (targetData.id === 'placeholder') {
                    console.log('Placeholder drop');
                    moveCard(sourceData.id as string, targetData.columnId, 0);
                } else {
                    const indexOfTarget = column.cards.findIndex(card => card.id === targetData.id);

                    let targetPosition = -1;
                    if (indexOfTarget === 0) {
                        targetPosition = 0;
                    } else if (indexOfTarget === column.cards.length - 1) {
                        targetPosition = -1;
                    } else {
                        targetPosition = targetData.position;
                    }

                    moveCard(sourceData.id as string, targetData.columnId, targetPosition);
                }
            }
        })
    }, [column.cards, moveCard]);

    return (
        <div className={cc(styles.column, classIf(isAboutToDrop, styles.dropping))} ref={ref}>
            <h2>{name}</h2>
            <div className={styles.tasks}>
                <DisplayCard columnId={column.id} cards={tasksToRender} />
            </div>
        </div>
    );
};

interface DisplayCardProps {
    cards: Card[];
    columnId: string;
}
function DisplayCard(props: DisplayCardProps) {
    const { cards, columnId } = props;

    if (!cards || cards.length === 0) {
        return (
            <PlaceholderCard columnId={columnId} />

        )
    }

    return (
        <>
            {
                cards.map((card, index) => (
                    <CardTask card={card} key={index} />
                ))
            }
        </>
    )
}