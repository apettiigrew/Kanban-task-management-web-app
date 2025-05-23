import { cc, classIf } from '@/utils/style-utils';
import {
    dropTargetForElements
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useContext, useEffect, useRef, useState } from 'react';
import styles from './Column.module.scss';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { AddCardButton, AppButtonWithIconSquared, CloseButton } from '../button/AppButton';
import { AddIcon, CloseIcon } from '../icons/icons';
import { AppInput } from '../input/AppInput';
import { ColumnWrapper } from './ColumnWrapper';
import { DropdownMenu } from '../dropdown-menu/DropdownMenu';
import { DeleteListModal } from '../modals/delete-list-modal';
import { DragLocationHistory } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types';
import { useBoardContext } from '@/providers/board-context-provider';
import { getColumnData, TCardData, isCardDropTargetData, isShallowEqual, isDraggingACard, isCardData, TCard, TColumn, isDraggingAColumn, isColumnData } from '@/utils/data';
import { CardShadow, CardTask } from '../card/card';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { unsafeOverflowAutoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element';
import { SettingsContext } from '@/providers/settings-context';


type TColumnState =
    | {
        type: 'is-card-over';
        isOverChildCard: boolean;
        dragging: DOMRect;
    }
    | {
        type: 'is-column-over';
    }
    | {
        type: 'idle';
    }
    | {
        type: 'is-dragging';
    };


const idle = { type: 'idle' } satisfies TColumnState;

const stateStyles: { [Key in TColumnState['type']]: string } = {
    idle: styles.idle,
    'is-card-over': styles.cardOver,
    'is-dragging': styles.dragging,
    'is-column-over': styles.columnOver,
};


interface ColumnProps {
    name: string;
    column: TColumn
}
export function Column(props: ColumnProps) {

    const { name, column } = props;
    const { moveCard, addCard, deleteList } = useBoardContext();
    const [isAboutToDrop, setIsAboutToDrop] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [columnTitle, setColumnTitle] = useState(name);
    const [isAddingCard, setIsAddingCard] = useState(false); // Track add card input
    const [newCardTitle, setNewCardTitle] = useState(''); // Track new card title
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const outerFullHeightRef = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const newCardInputRef = useRef<HTMLInputElement>(null); // Ref for new card input
    const tasksToRender = column.cards.length > 0 ? column.cards : column.cards.map(card => card);
    const [state, setState] = useState<TColumnState>(idle);
    const { settings } = useContext(SettingsContext);
    const scrollableRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select(); // Select all text for easy overwrite
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
        if (!outer || !scrollable) {
            return;
        }

        const data = getColumnData({ column });
        function setIsCardOver({ data, location }: { data: TCardData; location: DragLocationHistory }) {
            const innerMost = location.current.dropTargets[0];
            const isOverChildCard = Boolean(innerMost && isCardDropTargetData(innerMost.data));

            const proposed: TColumnState = {
                type: 'is-card-over',
                dragging: data.rect,
                isOverChildCard,
            };
            // optimization - don't update state if we don't need to.
            setState((current) => {
                if (isShallowEqual(proposed, current)) {
                    return current;
                }
                return proposed;
            });
        }

        return combine(
            dropTargetForElements({
                element: outer,
                getData: () => data,
                canDrop({ source }) {
                    setIsAboutToDrop(false);
                    return isDraggingACard({ source }) || isDraggingAColumn({ source });
                },
                getIsSticky: () => false,
                onDragStart({ source, location }) {
                    if (isCardData(source.data)) {
                        setIsCardOver({ data: source.data, location });
                    }
                },
                onDragEnter({ source, location }) {
                    if (isCardData(source.data)) {
                        setIsCardOver({ data: source.data, location });
                        return;
                    }
                    if (isColumnData(source.data) && source.data.column.id !== column.id) {
                        setState({ type: 'is-column-over' });
                    }
                },
                onDropTargetChange({ source, location }) {
                    if (isCardData(source.data)) {
                        setIsCardOver({ data: source.data, location });
                        return;
                    }
                },
                onDragLeave({ source }) {
                    if (isColumnData(source.data) && source.data.column.id === column.id) {
                        return;
                    }
                    setState(idle);
                },
                onDrop() {
                    setState(idle);
                },
            }),
            autoScrollForElements({
                canScroll({ source }) {
                    if (!settings.isOverElementAutoScrollEnabled) {
                        return false;
                    }

                    return isDraggingACard({ source });
                },
                getConfiguration: () => ({ maxScrollSpeed: settings.columnScrollSpeed }),
                element: scrollable,
            }),
            unsafeOverflowAutoScrollForElements({
                element: scrollable,
                getConfiguration: () => ({ maxScrollSpeed: settings.columnScrollSpeed }),
                canScroll({ source }) {
                    if (!settings.isOverElementAutoScrollEnabled) {
                        return false;
                    }

                    if (!settings.isOverflowScrollingEnabled) {
                        return false;
                    }

                    return isDraggingACard({ source });
                },
                getOverflow() {
                    return {
                        forTopEdge: {
                            top: 1000,
                        },
                        forBottomEdge: {
                            bottom: 1000,
                        },
                    };
                },
            }),
        );

    }, [column, column.cards, moveCard, settings.columnScrollSpeed, settings.isOverElementAutoScrollEnabled, settings.isOverflowScrollingEnabled]);

    const handleTitleClick = () => {
        setIsEditingTitle(true);
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
    };

    const handleTitleChange = (value: string) => {
        setColumnTitle(value);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setIsEditingTitle(false);
        }
    };

    const handleAddCardClick = () => {
        setIsAddingCard(true);
    };

    const handleAddCardCancel = () => {
        setIsAddingCard(false);
        setNewCardTitle('');
    };

    const handleAddCardConfirm = () => {
        if (newCardTitle.trim()) {
            addCard(column.id, newCardTitle.trim()); // Generated by Copilot
            setIsAddingCard(false);
            setNewCardTitle('');
        }
    };

    const handleAddCardInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleAddCardConfirm();
        } else if (e.key === 'Escape') {
            handleAddCardCancel();
        }
    };

    const handleDeleteList = () => {
        deleteList(column.id);
        setShowDeleteModal(false);
        setShowToast(true);
    };

    return (
        <ColumnWrapper
            className={
                cc(
                    stateStyles[state.type],
                    classIf(isAboutToDrop, styles.dropping),
                    styles.testing
                )}
            ref={outerFullHeightRef}>

            <div className={styles.columnHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {isEditingTitle ? (
                    <AppInput
                        ref={titleInputRef}
                        className={styles.titleInput}
                        value={columnTitle}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        onKeyDown={handleTitleKeyDown}
                    />
                ) : (
                    <h2 onClick={handleTitleClick}>{columnTitle}</h2>
                )}
                <DropdownMenu
                    label=""
                    items={[{
                        label: 'Delete List',
                        onClick: () => setShowDeleteModal(true),
                    }]}
                    align="right"
                />

            </div>
            <DeleteListModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onDelete={handleDeleteList}
                listName={columnTitle}
            />
            {showToast && (
                <div style={{ position: 'absolute', top: 8, right: 8, background: '#222', color: '#fff', padding: '0.5rem 1rem', borderRadius: 8, zIndex: 999 }}>
                    List deleted
                </div>
            )}
            <div className={styles.tasks}>
                <DisplayCard
                    columnId={column.id}
                    cards={tasksToRender}
                    state={state}
                />
            </div>
            <div className={styles.addCardContainer}>
                {isAddingCard ? (
                    <div className={styles.addCardInputRow}>
                        <AppInput
                            ref={newCardInputRef}
                            className={styles.titleInput}
                            value={newCardTitle}
                            onChange={setNewCardTitle}
                            onKeyDown={handleAddCardInputKeyDown}
                            placeholder="Enter a title or paste a link"
                        />

                        <div className={styles.actions}>
                            <AppButtonWithIconSquared
                                icon={<AddIcon />}
                                onClick={handleAddCardConfirm}
                            >
                                Add card
                            </AppButtonWithIconSquared>
                            <CloseButton
                                onClick={handleAddCardCancel}
                                icon={<CloseIcon />}
                            />
                        </div>
                    </div>
                ) : (
                    <AddCardButton
                        icon={<AddIcon />}
                        onClick={handleAddCardClick}
                    >
                        Add a card
                    </AddCardButton>
                )}
            </div>
        </ColumnWrapper>
    );
};

interface DisplayCardProps {
    cards: TCard[];
    columnId: string;
    state: TColumnState;
}
function DisplayCard(props: DisplayCardProps) {
    const { cards, columnId, state } = props;
    if (!cards || cards.length === 0) {
        return (<>
            {state.type === 'is-card-over' && (
                <CardShadow dragging={state.dragging} />
            )}
        </>);
    }

    return (
        <>
            {cards.map((card) => (
                <CardTask card={card} key={card.id} columnId={columnId} />
            ))}
        </>
    );
}
