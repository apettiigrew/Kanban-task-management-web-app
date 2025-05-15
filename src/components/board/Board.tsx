"use client";
import React from 'react';
import { ColumnType, useBoardContext } from '../../providers/board-context-provider';
import { Column } from '../column/Column';
import { AddCardButton } from '../button/AppButton';
import { AddIcon } from '../icons/icons';
import styles from './Board.module.scss';
import AddList from './AddList';

// The Board component now uses the context
const Board: React.FC<{ children?: React.ReactNode }> = () => {
    const { board, addList } = useBoardContext();
    const [showAddList, setShowAddList] = React.useState(false);

    const handleAddList = (name: string) => {
        addList(name);
        setShowAddList(false);
    };

    return (
        <div className={styles.board}>
            {board.columns.length === 0 ? (
                <div className={styles.emptyBoard}>
                    {showAddList ? (
                        <AddList
                            onAdd={handleAddList}
                            onCancel={() => setShowAddList(false)}
                        />
                    ) : (
                        <AddCardButton
                            className={styles.addListButton}
                            icon={<AddIcon />}
                            onClick={() => setShowAddList(true)}
                        >
                            Add a list
                        </AddCardButton>
                    )}
                </div>
            ) : (
                board.columns.map((column: ColumnType) => (
                    <Column
                        key={column.id}
                        name={column.name}
                        column={column}
                    />
                ))
            )}
        </div>
    );
};

export default Board;
