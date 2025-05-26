"use client";
import React, { useContext, useEffect, useRef } from 'react';
import { useBoardContext } from '../../providers/board-context-provider';
import { AddCardButton } from '../button/AppButton';
import { Column } from '../column/Column';
import { AddIcon } from '../icons/icons';
import { AddList } from './AddList';
import styles from './Board.module.scss';
import { isCardData, isCardDropTargetData, isColumnData, isDraggingACard, isDraggingAColumn, TColumn } from '@/utils/data';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import {
    extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { SettingsContext } from '@/providers/settings-context';
import { unsafeOverflowAutoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element';

export function Board() {
    const { board, setBoard, addList } = useBoardContext();
    const { settings } = useContext(SettingsContext);
    const [showAddList, setShowAddList] = React.useState(false);

    const scrollableRef = useRef<HTMLDivElement | null>(null);
    const handleAddList = (name: string) => {
        addList(name);
        setShowAddList(false);
    };

    // Extracted AddListButton for DRY and readability
    const AddListButton = () => (
        <AddCardButton
            className={styles.addListButton}
            icon={<AddIcon />}
            onClick={() => setShowAddList(true)}
        >
            Add a list
        </AddCardButton>
    );

    // Extracted AddListInput for DRY and readability
    const AddListInput = () => (
        <AddList
            onAdd={handleAddList}
            onCancel={() => setShowAddList(false)}
        />
    );


    useEffect(() => {
        const element = scrollableRef.current;
        if (!element) {
            return;
        }
        return combine(
            monitorForElements({
                canMonitor: isDraggingACard,
                onDrop({ source, location }) {
                    console.log("location:", location)
                    const dragging = source.data;
                    if (!isCardData(dragging)) {
                        return;
                    }

                    const innerMost = location.current.dropTargets[0];

                    if (!innerMost) {
                        return;
                    }
                    const dropTargetData = innerMost.data;
                    const homeColumnIndex = board.columns.findIndex(
                        (column) => column.id === dragging.columnId,
                    );
                    const home: TColumn | undefined = board.columns[homeColumnIndex];

                    if (!home) {
                        return;
                    }
                    const cardIndexInHome = home.cards.findIndex((card) => card.id === dragging.card.id);

                    // dropping on a card
                    if (isCardDropTargetData(dropTargetData)) {
                        const destinationColumnIndex = board.columns.findIndex(
                            (column) => column.id === dropTargetData.columnId,
                        );
                        const destination = board.columns[destinationColumnIndex];
                        // reordering in home column
                        if (home === destination) {
                            const cardFinishIndex = home.cards.findIndex(
                                (card) => card.id === dropTargetData.card.id,
                            );

                            // could not find cards needed
                            if (cardIndexInHome === -1 || cardFinishIndex === -1) {
                                return;
                            }

                            // no change needed
                            if (cardIndexInHome === cardFinishIndex) {
                                return;
                            }

                            const closestEdge = extractClosestEdge(dropTargetData);

                            const reordered = reorderWithEdge({
                                axis: 'vertical',
                                list: home.cards,
                                startIndex: cardIndexInHome,
                                indexOfTarget: cardFinishIndex,
                                closestEdgeOfTarget: closestEdge,
                            });

                            const updated: TColumn = {
                                ...home,
                                cards: reordered,
                            };
                            const columns = Array.from(board.columns);
                            columns[homeColumnIndex] = updated;
                            setBoard({ ...board, columns });
                            return;
                        }

                        // moving card from one column to another

                        // unable to find destination
                        if (!destination) {
                            return;
                        }

                        const indexOfTarget = destination.cards.findIndex(
                            (card) => card.id === dropTargetData.card.id,
                        );

                        const closestEdge = extractClosestEdge(dropTargetData);
                        const finalIndex = closestEdge === 'bottom' ? indexOfTarget + 1 : indexOfTarget;

                        // remove card from home list
                        const homeCards = Array.from(home.cards);
                        homeCards.splice(cardIndexInHome, 1);

                        // insert into destination list
                        const destinationCards = Array.from(destination.cards);
                        destinationCards.splice(finalIndex, 0, dragging.card);

                        const columns = Array.from(board.columns);
                        columns[homeColumnIndex] = {
                            ...home,
                            cards: homeCards,
                        };
                        columns[destinationColumnIndex] = {
                            ...destination,
                            cards: destinationCards,
                        };
                        setBoard({ ...board, columns });
                        return;
                    }

                    // dropping onto a column, but not onto a card
                    if (isColumnData(dropTargetData)) {
                        const destinationColumnIndex = board.columns.findIndex(
                            (column) => column.id === dropTargetData.column.id,
                        );
                        const destination = board.columns[destinationColumnIndex];

                        if (!destination) {
                            return;
                        }

                        // dropping on home
                        if (home === destination) {
                            console.log('moving card to home column');

                            // move to last position
                            const reordered = reorder({
                                list: home.cards,
                                startIndex: cardIndexInHome,
                                finishIndex: home.cards.length - 1,
                            });

                            const updated: TColumn = {
                                ...home,
                                cards: reordered,
                            };
                            const columns = Array.from(board.columns);
                            columns[homeColumnIndex] = updated;
                            setBoard({ ...board, columns });
                            return;
                        }

                        console.log('moving card to another column');

                        // remove card from home list

                        const homeCards = Array.from(home.cards);
                        homeCards.splice(cardIndexInHome, 1);

                        // insert into destination list
                        const destinationCards = Array.from(destination.cards);
                        destinationCards.splice(destination.cards.length, 0, dragging.card);

                        const columns = Array.from(board.columns);
                        columns[homeColumnIndex] = {
                            ...home,
                            cards: homeCards,
                        };
                        columns[destinationColumnIndex] = {
                            ...destination,
                            cards: destinationCards,
                        };
                        setBoard({ ...board, columns });
                        return;
                    }
                },
            }),
            monitorForElements({
                canMonitor: isDraggingAColumn,
                onDrop({ source, location }) {
                    const dragging = source.data;
                    if (!isColumnData(dragging)) {
                        return;
                    }

                    const innerMost = location.current.dropTargets[0];

                    if (!innerMost) {
                        return;
                    }
                    const dropTargetData = innerMost.data;

                    if (!isColumnData(dropTargetData)) {
                        return;
                    }

                    const homeIndex = board.columns.findIndex((column) => column.id === dragging.column.id);
                    const destinationIndex = board.columns.findIndex(
                        (column) => column.id === dropTargetData.column.id,
                    );

                    if (homeIndex === -1 || destinationIndex === -1) {
                        return;
                    }

                    if (homeIndex === destinationIndex) {
                        return;
                    }

                    const closestEdge = extractClosestEdge(dropTargetData);

                    const reordered = reorderWithEdge({
                        axis: 'horizontal',
                        list: board.columns,
                        startIndex: homeIndex,
                        indexOfTarget: destinationIndex,
                        closestEdgeOfTarget: closestEdge,
                    });

                    setBoard({ ...board, columns: reordered });
                },
            }),
            autoScrollForElements({
                canScroll({ source }) {
                    if (!settings.isOverElementAutoScrollEnabled) {
                        return false;
                    }

                    return isDraggingACard({ source }) || isDraggingAColumn({ source });
                },
                getConfiguration: () => ({ maxScrollSpeed: settings.boardScrollSpeed }),
                element,
            }),
            unsafeOverflowAutoScrollForElements({
                element,
                getConfiguration: () => ({ maxScrollSpeed: settings.boardScrollSpeed }),
                canScroll({ source }) {
                    if (!settings.isOverElementAutoScrollEnabled) {
                        return false;
                    }

                    if (!settings.isOverflowScrollingEnabled) {
                        return false;
                    }

                    return isDraggingACard({ source }) || isDraggingAColumn({ source });
                },
                getOverflow() {
                    return {
                        forLeftEdge: {
                            top: 1000,
                            left: 1000,
                            bottom: 1000,
                        },
                        forRightEdge: {
                            top: 1000,
                            right: 1000,
                            bottom: 1000,
                        },
                    };
                },
            }),
        );
    }, [board, setBoard, settings.boardScrollSpeed, settings.isOverElementAutoScrollEnabled, settings.isOverflowScrollingEnabled]);

    return (
        <div className={styles.board} ref={scrollableRef}>
            {board.columns.length === 0 ? (
                <div className={styles.emptyBoard}>
                    {showAddList ? <AddListInput /> : <AddListButton />}
                </div>
            ) : (
                <div className={styles.listsRow}>
                    {board.columns.map((column: TColumn) => (
                        <div className={styles.listItem} key={column.id}>
                            <Column
                                name={column.title}
                                column={column}
                            />
                        </div>
                    ))}
                    {/* Always keep AddList button/input to the right of the last column */}
                    <div className={styles.listItem}>
                        <div className={styles.addListContainer}>
                            {showAddList ? <AddListInput /> : <AddListButton />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

