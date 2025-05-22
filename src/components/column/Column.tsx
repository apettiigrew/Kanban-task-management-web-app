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
import { AddCardButton, AppButtonWithIconSquared, CloseButton } from '../button/AppButton';
import { AddIcon, CloseIcon } from '../icons/icons';
import { AppInput } from '../input/AppInput';
import { ColumnWrapper } from './ColumnWrapper';
import { DropdownMenu } from '../dropdown-menu/DropdownMenu';
import { DeleteListModal } from '../modals/delete-list-modal';

interface ColumnProps {
    name: string;
    column: ColumnType
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

                if (!source || !target) {
                    return;
                }

                const sourceData = source.data.card as Card;
                const targetData = target.data.card as Card;

                console.log('sourceData', sourceData);
                console.log('targetData', targetData);
                if (!sourceData || !targetData) {
                    return;
                }

                if (targetData.id === 'placeholder') {
                    moveCard(sourceData.id as string, targetData.columnId, 0);
                } else {
                    console.log("doing the move");
                
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

    const handleDeleteList = () => {
        deleteList(column.id);
        setShowDeleteModal(false);
        setShowToast(true);
    };

    return (
        <ColumnWrapper className={cc(classIf(isAboutToDrop, styles.dropping))} ref={ref}>
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
    cards: Card[];
    columnId: string;
}
function DisplayCard(props: DisplayCardProps) {
    const { cards, columnId } = props;
    // if (!cards || cards.length === 0) {
    //     return (
    //         <PlaceholderCard columnId={columnId} />
    //     );
    // }
    return (
        <>
            {cards.map((card) => (
                <CardTask card={card} key={card.id} columnId={columnId} />
            ))}
        </>
    );
}
