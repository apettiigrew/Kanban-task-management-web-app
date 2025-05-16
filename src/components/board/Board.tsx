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
            ) :
                <>
                    {board.columns.map((column: ColumnType) => (
                        <Column
                            key={column.id}
                            name={column.name}
                            column={column}
                        />
                    ))}
                    {/* Always keep AddList button/input to the right of the last column */}
                    <div className={styles.addListContainer}>
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
                </>
            }
        </div>
    );
};

