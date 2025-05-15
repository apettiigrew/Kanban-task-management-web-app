import React, { useEffect, useRef } from 'react';
import styles from './placeholder-card.module.scss';
import { cc, classIf } from '@/utils/style-utils';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

interface PlaceholderCardProps {
    columnId: string;
    className?: string;
}

export function PlaceholderCard(props: PlaceholderCardProps) {
    const { columnId, className } = props;
    const ref = useRef<HTMLDivElement>(null);
    const [isAboutToDrop, setIsAboutToDrop] = React.useState(false);
    useEffect(() => {
        const element = ref.current;
        if (!element) {
            return;
        }

        dropTargetForElements({
            element,
            getData() {
                return {
                    id: "placeholder",
                    position: 0,
                    columnId: columnId,
                };
            },
            onDragEnter: () => {
                // console.log('Drag enter');
                setIsAboutToDrop(true);
            },
            onDragLeave: () => {
                // console.log('Drag leave');
                setIsAboutToDrop(false);
            },
            onDrop: () => {
                // console.log('Dropped');
                setIsAboutToDrop(false);
            },
        })
    }, [columnId]);
    return (
        <div
            className={cc(styles.placeholderCard, className, classIf(isAboutToDrop, styles.dropping))}
            data-test-id={columnId}
            ref={ref}
        >
            <div className={styles.content}>
                {/* <span className={styles.dashes}></span> */}
            </div>
        </div>
    );
}
