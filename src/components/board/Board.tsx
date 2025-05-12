"use client";
import React from 'react';
import { useBoardContext } from '../../context/BoardContext';
import Column from '../column/Column';
import styles from './Board.module.scss';

// The Board component now uses the context
const Board: React.FC<{ children?: React.ReactNode }> = () => {
    const { orderedColumnIds, columnMap } = useBoardContext();

    console.log("orderedColumnIds", orderedColumnIds);
    console.log("columnMap", columnMap);
    return (
        <div className={styles.board}>
            {orderedColumnIds.map((columnId) => (
                    <Column
                        key={columnId}
                        title={columnId}
                        column={columnMap[columnId]}
                    />
                ))
            }
        </div>
    );
};

export default Board;
