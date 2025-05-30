

import { useBoardContext } from '@/providers/board-context-provider';
import { SettingsContext } from '@/providers/settings-context';
import { getColumnData, isCardData, isCardDropTargetData, isColumnData, isDraggingACard, isDraggingAColumn, isShallowEqual, TCard, TCardData, TColumn } from '@/utils/data';
import { cc } from '@/utils/style-utils';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { unsafeOverflowAutoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element';
import {
    attachClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { DragLocationHistory } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types';
import {
    draggable,
    dropTargetForElements
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useContext, useEffect, useRef, useState } from 'react';
import { Input } from './ui/input';
import { ColumnWrapper } from './column-wrapper';
import { Button } from './ui/button';
import { CardShadow, CardTask } from './card';

type TColumnState =
    | { type: 'is-card-over'; isOverChildCard: boolean; dragging: DOMRect }
    | { type: 'is-column-over' }
    | { type: 'idle' }
    | { type: 'is-dragging' };

const idle = { type: 'idle' } satisfies TColumnState;

const stateStyles: { [Key in TColumnState['type']]: string } = {
    idle: '',
    'is-card-over': 'border-2 border-blue-500 bg-blue-50 shadow-lg scale-[1.02] transition-all',
    'is-dragging': 'opacity-60 rotate-2 shadow-2xl transition-all',
    'is-column-over': 'border-2 border-emerald-500 bg-emerald-50 shadow-lg scale-[1.02] transition-all',
};

interface ColumnProps {
    name: string;
    column: TColumn;
}
export function Column({ name, column }: ColumnProps) {
    const { moveCard, addCard } = useBoardContext();
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [columnTitle, setColumnTitle] = useState(name);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');
    const outerFullHeightRef = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const newCardInputRef = useRef<HTMLInputElement>(null);
    const scrollableRef = useRef<HTMLDivElement | null>(null);
    const tasksToRender = column.cards.length > 0 ? column.cards : column.cards.map(card => card);
    const [state, setState] = useState<TColumnState>(idle);
    const { settings } = useContext(SettingsContext);

    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [isEditingTitle]);

    useEffect(() => {
        if (isAddingCard && newCardInputRef.current) {
            newCardInputRef.current.focus();
        }
    }, [isAddingCard]);

    useEffect(() => {
        const outer = outerFullHeightRef.current;
        const scrollable = scrollableRef.current;
        if (!outer || !scrollable) return;

        const data = getColumnData({ column });

        function setIsCardOver({ data, location }: { data: TCardData; location: DragLocationHistory }) {
            const innerMost = location.current.dropTargets[0];
            const isOverChildCard = Boolean(innerMost && isCardDropTargetData(innerMost.data));

            const proposed: TColumnState = {
                type: 'is-card-over',
                dragging: data.rect,
                isOverChildCard,
            };
            setState((current) => (isShallowEqual(proposed, current) ? current : proposed));
        }

        return combine(
            draggable({
                element: outer,
                getInitialData: () => data,
                onDragStart: () => setState({ type: 'is-dragging' }),
                onDrop: () => setState(idle),
            }),
            dropTargetForElements({
                element: outer,
                getData: ({ input, element }) => attachClosestEdge(data, { element, input, allowedEdges: ['left', 'right'] }),
                canDrop: ({ source }) => isDraggingACard({ source }) || isDraggingAColumn({ source }),
                getIsSticky: () => true,
                onDragStart: ({ source, location }) => isCardData(source.data) && setIsCardOver({ data: source.data, location }),
                onDragEnter: ({ source, location }) => {
                    if (isCardData(source.data)) return setIsCardOver({ data: source.data, location });
                    if (isColumnData(source.data) && source.data.column.id !== column.id) setState({ type: 'is-column-over' });
                },
                onDropTargetChange: ({ source, location }) => isCardData(source.data) && setIsCardOver({ data: source.data, location }),
                onDragLeave: ({ source }) => !isColumnData(source.data) || source.data.column.id !== column.id ? setState(idle) : undefined,
                onDrop: () => setState(idle),
            }),
            autoScrollForElements({
                canScroll: ({ source }) => settings.isOverElementAutoScrollEnabled && isDraggingACard({ source }),
                getConfiguration: () => ({ maxScrollSpeed: settings.columnScrollSpeed }),
                element: scrollable,
            }),
            unsafeOverflowAutoScrollForElements({
                element: scrollable,
                getConfiguration: () => ({ maxScrollSpeed: settings.columnScrollSpeed }),
                canScroll: ({ source }) =>
                    settings.isOverElementAutoScrollEnabled &&
                    settings.isOverflowScrollingEnabled &&
                    isDraggingACard({ source }),
                getOverflow: () => ({ forTopEdge: { top: 1000 }, forBottomEdge: { bottom: 1000 } }),
            })
        );
    }, [column, column.cards, moveCard, settings]);

    return (
        <ColumnWrapper
            className={cc(
                'bg-gray-50 text-gray-900 rounded-2xl p-4 border border-gray-200 max-w-[260px] w-full max-h-[90vh] h-min flex flex-col gap-4',
                stateStyles[state.type]
            )}
            ref={outerFullHeightRef}
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 flex-1">
                    {isEditingTitle ? (
                        <Input
                            ref={titleInputRef}
                            className="text-sm font-semibold text-gray-500"
                            value={columnTitle}
                            onChange={(e) => setColumnTitle(e.target.value)}
                            onBlur={() => setIsEditingTitle(false)}
                            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                        />
                    ) : (
                        <h2 onClick={() => setIsEditingTitle(true)} className="text-sm font-semibold text-gray-500 cursor-pointer">
                            {columnTitle}
                        </h2>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto flex-grow max-h-screen min-h-0" ref={scrollableRef}>
                <DisplayCard columnId={column.id} cards={tasksToRender} state={state} />
            </div>
            <div>
                {isAddingCard ? (
                    <div className="flex flex-col gap-2">
                        <Input
                            ref={newCardInputRef}
                            className="text-sm font-medium"
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') addCard(column.id, newCardTitle.trim());
                                if (e.key === 'Escape') setIsAddingCard(false);
                            }}
                            placeholder="Enter a title or paste a link"
                        />
                        <div className="flex justify-between gap-3">
                            <Button onClick={() => addCard(column.id, newCardTitle.trim())}>
                                Add card
                            </Button>
                            <Button onClick={() => setIsAddingCard(false)} />
                        </div>
                    </div>
                ) : (
                    <Button onClick={() => setIsAddingCard(true)}>
                        Add a card
                    </Button>
                )}
            </div>
        </ColumnWrapper>
    );
}

interface DisplayCardProps {
    cards: TCard[];
    columnId: string;
    state: TColumnState;
}
function DisplayCard({ cards, columnId, state }: DisplayCardProps) {
    if (!cards || cards.length === 0) {
        return state.type === 'is-card-over' ? <CardShadow dragging={state.dragging} /> : null;
    }

    return (
        <>
            {cards.map((card) => (
                <CardTask card={card} key={card.id} columnId={columnId} />
            ))}
        </>
    );
}