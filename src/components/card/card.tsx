
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
import { TCard, getCardData, isDraggingACard, getCardDropTargetData, isCardData, isShallowEqual } from '@/utils/data';


interface CardProps {
    card: TCard;
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


export function CardTask(props: CardProps) {
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


export function CardShadow({ dragging }: { dragging: DOMRect }) {
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
    card: TCard;
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
                outerStyles[state.type],
                classIf(props.state.type === 'dragging', styles.dragging)
            )}>

            <div
                data-test-id={card.id}
                ref={innerRef}
                onClick={handleCardClick}
                className={cc(
                    styles.task,
                    innerStyles[state.type],
                    classIf(state.type === 'dragging', styles.dragging)
                )}>
                {card.title}
            </div>
        </div>
    );
}