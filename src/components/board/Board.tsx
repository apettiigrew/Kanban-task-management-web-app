"use client";
import React from 'react';
import { ColumnType, useBoardContext } from '../../providers/board-context-provider';
import { AddCardButton } from '../button/AppButton';
import { Column } from '../column/Column';
import { AddIcon } from '../icons/icons';
import AddList from './AddList';
import styles from './Board.module.scss';


export function Board() {
    
    const { board, addList } = useBoardContext();
    const [showAddList, setShowAddList] = React.useState(false);

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

    return (
        <div className={styles.board}>
            {board.columns.length === 0 ? (
                <div className={styles.emptyBoard}>
                    {showAddList ? <AddListInput /> : <AddListButton />}
                </div>
            ) : (
                <div className={styles.listsRow}>
                    {board.columns.map((column: ColumnType) => (
                        <div className={styles.listItem} key={column.id}>
                            <Column
                                name={column.name}
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

