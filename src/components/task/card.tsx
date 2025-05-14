import { Card, useBoardContext } from '@/providers/board-context-provider';
import { cc, classIf } from '@/utils/style-utils';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { BaseEventPayload, DropTargetLocalizedData, ElementDragType } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types';
import {
    draggable,
    dropTargetForElements
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import React, { useEffect, useRef } from 'react';
import styles from './card.module.scss';
interface TaskProps {
    card: Card;
}

type State =
    | { type: 'idle' }
    | { type: 'preview'; container: HTMLElement; rect: DOMRect }
    | { type: 'dragging' };

const draggingState: State = { type: 'idle' };
export function TaskCard(props: TaskProps) {
    const { moveCard } = useBoardContext();
    const ref = useRef<HTMLDivElement | null>(null);
    const { card } = props;

    const [isDragging, setIsDragging] = React.useState<State>(draggingState);
    useEffect(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        return combine(
            draggable({
                element,
                getInitialData: () => {
                    return card;
                },
                onDragStart: () => {
                    setIsDragging({ type: 'dragging' });
                },
                onDrop: () => {
                    setIsDragging({ type: 'idle' });
                },

            }),
            dropTargetForElements({
                element,
                getData: () => {
                    return card;
                },
                onDrop: ({ source, self }: BaseEventPayload<ElementDragType> & DropTargetLocalizedData) => {
                    const target = self.data as Card;
                    console.log('target', target);
                    console.log('source', source);
                    moveCard(
                        source.data.id as string,
                        target.columnId as string,
                        target.position
                    );

                }
            }),
        );
    }, [card, moveCard]);

    return (
        <div
            data-test-id={card.id}
            ref={ref}
            className={cc(styles.task, classIf(isDragging.type === 'dragging', styles.dragging))}>
            {card.id} {card.title}
        </div>
    );
};
