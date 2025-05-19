import { Card } from '@/providers/board-context-provider';
import { cc, classIf } from '@/utils/style-utils';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
    draggable,
    dropTargetForElements
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import React, { useEffect, useRef, useState } from 'react';
import styles from './card.module.scss';
import { CardDetailModal } from '../modals/card-detail-modal';

interface TaskProps {
    card: Card;
}

type State =
    | { type: 'idle' }
    | { type: 'preview'; container: HTMLElement; rect: DOMRect }
    | { type: 'dragging' };

const draggingState: State = { type: 'idle' };
export function CardTask(props: TaskProps) {
    // const { moveCard } = useBoardContext();
    const ref = useRef<HTMLDivElement | null>(null);
    const [isDragging, setIsDragging] = React.useState<State>(draggingState);
    const { card } = props;
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [, setIsAboutToDrop] = React.useState(false);

    // Handler to open card detail modal
    const handleCardClick = (e: React.MouseEvent) => {
        // Prevent modal from opening during drag operations
        if (isDragging.type === 'dragging') return;

        // Stop the click from triggering drag events
        e.stopPropagation();
        setIsDetailModalOpen(true);
    };

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
                onDragEnter: () => {
                    setIsAboutToDrop(true);
                },
                canDrop: ({ source }) => {
                    return source.element !== element;
                },
                onDrop: () => {
                    setIsAboutToDrop(false);
                }
            }),
        );
    }, [card]);

    return (
        <>
            <div
                data-test-id={card.id}
                ref={ref}
                onClick={handleCardClick}
                className={cc(
                    styles.task,
                    classIf(isDragging.type === 'dragging', styles.dragging)
                )}>
                {card.title}
            </div>
            <CardDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                card={card}
            />
        </>
    );
};
