import { Card } from '@/providers/board-context-provider';
import { cc, classIf } from '@/utils/style-utils';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
    draggable,
    dropTargetForElements
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import styles from './card.module.scss';
import { CardDetailModal } from '../modals/card-detail-modal';
import {
    extractClosestEdge,
    attachClosestEdge,
    type Edge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

interface CardProps {
    card: Card;
    columnId: string;
}

type CardState =
    | { type: 'idle' }
    | { type: 'preview'; container: HTMLElement; rect: DOMRect }
    | { type: 'dragging' }
    | {
        type: 'is-dragging';
    }
    | {
        type: 'is-dragging-and-left-self';
    }
    | {
        type: 'is-over';
        dragging: DOMRect;
        closestEdge: Edge;
    }
    | {
        type: 'preview';
        container: HTMLElement;
        dragging: DOMRect;
    };



const draggingState: CardState = { type: 'idle' };

export function isShallowEqual(
    obj1: Record<string, unknown>,
    obj2: Record<string, unknown>,
): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }
    return keys1.every((key1) => Object.is(obj1[key1], obj2[key1]));
}


export function isCardData(value: Record<string | symbol, unknown>): value is TCardData {
    return Boolean(value[cardKey]);
}

const cardKey = Symbol('card');
export type TCardData = {
    [cardKey]: true;
    card: Card;
    columnId: string;
    rect: DOMRect;
};

export function getCardData({
    card,
    rect,
    columnId,
}: Omit<TCardData, typeof cardKey> & { columnId: string }): TCardData {
    return {
        [cardKey]: true,
        rect,
        card,
        columnId,
    };
}

const cardDropTargetKey = Symbol('card-drop-target');
export type TCardDropTargetData = {
    [cardDropTargetKey]: true;
    card: Card;
    columnId: string;
};

export function getCardDropTargetData({
    card,
    columnId,
}: Omit<TCardDropTargetData, typeof cardDropTargetKey> & {
    columnId: string;
}): TCardDropTargetData {
    return {
        [cardDropTargetKey]: true,
        card,
        columnId,
    };
}

export function isDraggingACard({
    source,
}: {
    source: { data: Record<string | symbol, unknown> };
}): boolean {
    return isCardData(source.data);
}


export function CardTask(props: CardProps) {
    // const { moveCard } = useBoardContext();
    // const ref = useRef<HTMLDivElement | null>(null);
    const [cardState, setCardState] = React.useState<CardState>(draggingState);
    const { card, columnId } = props;
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const outerRef = useRef<HTMLDivElement | null>(null);
    const innerRef = useRef<HTMLDivElement | null>(null);

    // Handler to open card detail modal
    const handleCardClick = (e: React.MouseEvent) => {
        // Prevent modal from opening during drag operations
        if (cardState.type === 'dragging') return;

        // Stop the click from triggering drag events
        e.stopPropagation();
        setIsDetailModalOpen(true);
    };

    useEffect(() => {
        const outer = outerRef.current;
        const inner = innerRef.current;

        if (!inner || !outer) {
            return;
        }

        return combine(
            draggable({
                element: inner,
                getInitialData: ({ element }) =>
                    getCardData({ card, columnId, rect: element.getBoundingClientRect() }),
                onDragStart: () => {
                    setCardState({ type: 'is-dragging' });
                },
                onDrop: () => {
                    setCardState({ type: 'idle' });
                },

            }),
            dropTargetForElements({
                element: outer,
                getIsSticky: () => true,
                canDrop: isDraggingACard,
                getData: ({ element, input }) => {
                    const data = getCardDropTargetData({ card, columnId });
                    return attachClosestEdge(data, { element, input, allowedEdges: ['top', 'bottom'] });
                },
                onDragEnter({ source, self }) {
                    if (!isCardData(source.data)) {
                        return;
                    }
                    if (source.data.card.id === card.id) {
                        return;
                    }
                    const closestEdge = extractClosestEdge(self.data);
                    if (!closestEdge) {
                        return;
                    }

                    setCardState({ type: 'is-over', dragging: source.data.rect, closestEdge });
                },
                onDrag({ source, self }) {
                    if (!isCardData(source.data)) {
                        return;
                    }
                    if (source.data.card.id === card.id) {
                        return;
                    }
                    const closestEdge = extractClosestEdge(self.data);
                    if (!closestEdge) {
                        return;
                    }
                    // optimization - Don't update react state if we don't need to.
                    const proposed: CardState = { type: 'is-over', dragging: source.data.rect, closestEdge };
                    setCardState((current) => {
                        if (isShallowEqual(proposed, current)) {
                            return current;
                        }
                        return proposed;
                    });
                },
                onDragLeave({ source }) {
                    if (!isCardData(source.data)) {
                        return;
                    }
                    if (source.data.card.id === card.id) {
                        setCardState({ type: 'is-dragging-and-left-self' });
                        return;
                    }
                    setCardState({ type: 'idle' });
                },
                onDrop() {
                    setCardState({ type: 'idle' });
                },
            }),
        );
    }, [card, columnId]);

    console.log('cardState', cardState.type);
    return (
        <>
            {/* Put a shadow after the item if closer to the bottom edge */}
            {cardState.type === 'is-over' && cardState.closestEdge === 'top' ? (
                <CardShadow dragging={cardState.dragging} />
            ) : null}

            <CardDisplay
                card={card}
                state={cardState}
                outerRef={outerRef}
                innerRef={innerRef}
                handleCardClick={handleCardClick}
            />
            {/* Put a shadow after the item if closer to the bottom edge */}
            {cardState.type === 'is-over' && cardState.closestEdge === 'bottom' ? (
                <CardShadow dragging={cardState.dragging} />
            ) : null}
            <CardDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                card={card}
            />
        </>
    );
};


function CardShadow({ dragging }: { dragging: DOMRect }) {
    console.log('dragging', dragging);
    return (
        <div className={styles.shadow}
            style={{ height: dragging.height }}>

        </div>
    );
}


const innerStyles: { [Key in CardState['type']]?: string } = {
    'idle': styles.idle,
    'is-dragging': styles.opacityChange,
};

const outerStyles: { [Key in CardState['type']]?: string } = {
    // We no longer render the draggable item after we have left it
    // as it's space will be taken up by a shadow on adjacent items.
    // Using `display:none` rather than returning `null` so we can always
    // return refs from this component.
    // Keeping the refs allows us to continue to receive events during the drag.
    'is-dragging-and-left-self':  styles.hidden,
};

interface CardDisplayProps {
    card: Card;
    state: CardState;
    outerRef?: MutableRefObject<HTMLDivElement | null>;
    innerRef?: MutableRefObject<HTMLDivElement | null>;
    handleCardClick: (e: React.MouseEvent) => void;
}
export function CardDisplay(props: CardDisplayProps) {
    const { state, card, outerRef, innerRef, handleCardClick } = props;
    return (
        <div
            ref={outerRef}

            className={cc(
                // styles.task,
                styles.testOuter,
                outerStyles[state.type],
                classIf(props.state.type === 'dragging', styles.dragging)
            )}
        >
            <div
                data-test-id={card.id}
                ref={innerRef}
                onClick={handleCardClick}
                className={cc(
                    styles.task,
                    styles.testInner,
                    innerStyles[state.type],
                    classIf(state.type === 'dragging', styles.dragging)
                )}>
                {card.title}
            </div>
        </div>
    );
}