// TailwindCSS version of the CardTask component
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import React, { MutableRefObject, useEffect, useRef, useState } from 'react';

import {
  TCard,
  getCardData,
  getCardDropTargetData,
  isCardData,
  isDraggingACard,
  isShallowEqual,
} from '@/utils/data';
import { cc, classIf } from '@/utils/style-utils';
import { TaskEditModal } from './tasks/task-edit-modal';
import { Task } from '@/lib/validations/task';

interface CardProps {
  card: TCard;
  columnId: string;
}

type CardState =
  | { type: 'idle' }
  | { type: 'preview'; container: HTMLElement; rect: DOMRect }
  | { type: 'dragging' }
  | { type: 'is-dragging' }
  | { type: 'is-dragging-and-left-self' }
  | { type: 'is-over'; dragging: DOMRect; closestEdge: Edge };

const draggingState: CardState = { type: 'idle' };

export function CardTask(props: CardProps) {
  const [cardState, setCardState] = useState<CardState>(draggingState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { card, columnId } = props;
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cardState.type === 'is-dragging') return;
    setIsModalOpen(true);
  };

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!inner || !outer) return;

    return combine(
      draggable({
        element: inner,
        getInitialData: ({ element }) =>
          getCardData({ card, columnId, rect: element.getBoundingClientRect() }),
        onDragStart: () => setCardState({ type: 'is-dragging' }),
        onDrop: () => setCardState({ type: 'idle' }),
      }),
      dropTargetForElements({
        element: outer,
        getIsSticky: () => true,
        canDrop: isDraggingACard,
        getData: ({ element, input }) =>
          attachClosestEdge(getCardDropTargetData({ card, columnId }), {
            element,
            input,
            allowedEdges: ['top', 'bottom'],
          }),
        onDragEnter({ source, self }) {
          if (!isCardData(source.data) || source.data.card.id === card.id) return;
          const closestEdge = extractClosestEdge(self.data);
          if (!closestEdge) return;
          setCardState({ type: 'is-over', dragging: source.data.rect, closestEdge });
        },
        onDrag({ source, self }) {
          if (!isCardData(source.data) || source.data.card.id === card.id) return;
          const closestEdge = extractClosestEdge(self.data);
          if (!closestEdge) return;
          const proposed: CardState = { type: 'is-over', dragging: source.data.rect, closestEdge };
          setCardState((current) => (isShallowEqual(proposed, current) ? current : proposed));
        },
        onDragLeave({ source }) {
          if (!isCardData(source.data)) return;
          setCardState(
            source.data.card.id === card.id
              ? { type: 'is-dragging-and-left-self' }
              : { type: 'idle' }
          );
        },
        onDrop: () => setCardState({ type: 'idle' }),
      })
    );
  }, [card, columnId]);

  // Convert TCard to Task type
  const task: Task = {
    id: card.id.toString(),
    title: card.title,
    description: card.description || null,
    order: 0, // This will be updated by the backend
    labels: [],
    projectId: '', // This will be updated by the backend
    columnId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <>
      {cardState.type === 'is-over' && cardState.closestEdge === 'top' && (
        <CardShadow dragging={cardState.dragging} />
      )}

      <CardDisplay
        card={card}
        state={cardState}
        outerRef={outerRef}
        innerRef={innerRef}
        handleCardClick={handleCardClick}
      />

      {cardState.type === 'is-over' && cardState.closestEdge === 'bottom' && (
        <CardShadow dragging={cardState.dragging} />
      )}

      <TaskEditModal
        card={card}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export function CardShadow({ dragging }: { dragging: DOMRect }) {
  return <div className="flex-shrink-0 rounded-md bg-slate-900" style={{ height: dragging.height }} />;
}

const innerStyles: { [Key in CardState['type']]?: string } = {
  idle: 'hover:cursor-grab',
  'is-dragging': 'opacity-50',
};

const outerStyles: { [Key in CardState['type']]?: string } = {
  'is-dragging-and-left-self': 'hidden',
};

interface CardDisplayProps {
  card: TCard;
  state: CardState;
  outerRef?: MutableRefObject<HTMLDivElement | null>;
  innerRef?: MutableRefObject<HTMLDivElement | null>;
  handleCardClick: (e: React.MouseEvent) => void;
}

export function CardDisplay({ card, state, outerRef, innerRef, handleCardClick }: CardDisplayProps) {
  return (
    <div
      ref={outerRef}
      className={cc(
        outerStyles[state.type],
        classIf(state.type === 'is-dragging', 'opacity-50')
      )}
    >
      <div
        data-test-id={card.id}
        ref={innerRef}
        onClick={handleCardClick}
        className={cc(
          'bg-white rounded-md p-4 text-gray-900 text-sm border border-gray-200 shadow-sm transition-transform duration-200 ease-in-out cursor-pointer relative',
          'hover:-translate-y-0.5 hover:shadow-lg active:cursor-grabbing',
          innerStyles[state.type],
          classIf(state.type === 'is-dragging', 'opacity-50 shadow-none')
        )}
      >
        {card.title}
      </div>
    </div>
  );
}