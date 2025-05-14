import { ColumnType } from '../../providers/board-context-provider';
import { TaskCard } from '../task/card';
import styles from './Column.module.scss';

interface ColumnProps {
    name: string;
    column: ColumnType
}

export function Column(props: ColumnProps) {
    const { name, column } = props;
    const tasksToRender = column.cards.length > 0 ? column.cards : column.cards.map(card => card);

    return (
        <div className={styles.column}>
            <h2>{name}</h2>
            <div className={styles.tasks}>
                {tasksToRender.map((task, index) => (
                    <TaskCard card={task} key={index} />
                ))}
            </div>
        </div>
    );
};


