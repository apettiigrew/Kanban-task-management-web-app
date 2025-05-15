"use client";
import React from 'react';
import { ColumnType, useBoardContext } from '../../providers/board-context-provider';
import { Column } from '../column/Column';
import styles from './Board.module.scss';

// The Board component now uses the context
const Board: React.FC<{ children?: React.ReactNode }> = () => {
    const { board } = useBoardContext();

    return (
        <div className={styles.board}>
            {board.columns.map((column: ColumnType) => (
                <Column
                    key={column.id}
                    name={column.name}
                    column={column}
                />
            ))}
        </div>
    );
};

export default Board;
