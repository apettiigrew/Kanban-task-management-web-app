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
import { AddCardButton, CloseButton } from '../button/AppButton';
import { AddIcon, CloseIcon } from '../icons/icons';
import { AppInput } from '../input/AppInput';
import { ColumnWrapper } from './ColumnWrapper';

interface ColumnProps {
    name: string;
    column: ColumnType
}

export function Column(props: ColumnProps) {
    const { name, column } = props;
    const { moveCard, addCard } = useBoardContext(); // Added addCard from context
    const [isAboutToDrop, setIsAboutToDrop] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [columnTitle, setColumnTitle] = useState(name);
    const [isAddingCard, setIsAddingCard] = useState(false); // Track add card input
    const [newCardTitle, setNewCardTitle] = useState(''); // Track new card title
    const ref = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const newCardInputRef = useRef<HTMLInputElement>(null); // Ref for new card input
    const tasksToRender = column.cards.length > 0 ? column.cards : column.cards.map(card => card);

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

                // console.log('Source:', source);
                // console.log('Target:', target);
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

    const handleTitleClick = () => {
        setIsEditingTitle(true);
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
        // Here you would typically update the column title in your state/API
        // For now, we're just keeping it in local state
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

    return (
        <ColumnWrapper className={cc(classIf(isAboutToDrop, styles.dropping))} ref={ref}>
            <div className={styles.columnHeader}>
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
            </div>
            <div className={styles.tasks}>
                <DisplayCard columnId={column.id} cards={tasksToRender} />
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

                        {isAddingCard && <div className={styles.actions}>
                            <AddCardButton
                                className={styles.addListButton}
                                icon={<AddIcon />}
                            // onClick={handleAdd}
                            >
                                Add card
                            </AddCardButton>
                            <CloseButton
                                className={styles.closeButton}
                                // onClick={onCancel}
                                icon={<CloseIcon />}
                            />
                        </div>}

                        {!isAddingCard && <div>
                            <AddCardButton
                                icon={<AddIcon />}
                                onClick={handleAddCardConfirm}
                            >
                                Add card
                            </AddCardButton>
                            <CloseButton
                                onClick={handleAddCardCancel}
                                icon={<CloseIcon />}
                            />
                        </div>}


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
    cards: Card[];
    columnId: string;
}
function DisplayCard(props: DisplayCardProps) {
    const { cards, columnId } = props;
    if (!cards || cards.length === 0) {
        return (
            <PlaceholderCard columnId={columnId} />
        );
    }
    return (
        <>
            {cards.map((card) => (
                <CardTask card={card} key={card.id} />
            ))}
        </>
    );
}
// Generated by Copilot