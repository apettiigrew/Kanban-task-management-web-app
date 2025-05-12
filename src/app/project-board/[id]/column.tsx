import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import {
	attachClosestEdge,
	type Edge,
	extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { centerUnderPointer } from '@atlaskit/pragmatic-drag-and-drop/element/center-under-pointer';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import invariant from "tiny-invariant";
import { ColumnType } from ".";
import { useBoardContext } from "./board-context";
import { ColumnContext, ColumnContextProps } from "./column-context";
import styles from "./column.module.scss";
import { Card } from "./card";

type State =
    | { type: 'idle' }
    | { type: 'is-card-over' }
    | { type: 'is-column-over'; closestEdge: Edge | null }
    | { type: 'generate-safari-column-preview'; container: HTMLElement }
    | { type: 'generate-column-preview' };

const isCardOver: State = { type: 'is-card-over' };
// preventing re-renders with stable state objects
const idle: State = { type: 'idle' };

export const Column = memo(function Column({ column }: { column: ColumnType }) {
    const columnId = column.columnId;
    const columnRef = useRef<HTMLDivElement | null>(null);
    const columnInnerRef = useRef<HTMLDivElement | null>(null);
    const headerRef = useRef<HTMLDivElement | null>(null);
    const scrollableRef = useRef<HTMLDivElement | null>(null);
    const [state, setState] = useState<State>(idle);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const { instanceId, registerColumn } = useBoardContext();

    useEffect(() => {
        invariant(columnRef.current);
        invariant(columnInnerRef.current);
        invariant(headerRef.current);
        invariant(scrollableRef.current);
        return combine(
            registerColumn({
                columnId,
                entry: {
                    element: columnRef.current,
                },
            }),
            draggable({
                element: columnRef.current,
                dragHandle: headerRef.current,
                getInitialData: () => ({ columnId, type: 'column', instanceId }),
                onGenerateDragPreview: ({ nativeSetDragImage }) => {
                    const isSafari: boolean =
                        navigator.userAgent.includes('AppleWebKit') && !navigator.userAgent.includes('Chrome');

                    if (!isSafari) {
                        setState({ type: 'generate-column-preview' });
                        return;
                    }
                    setCustomNativeDragPreview({
                        getOffset: centerUnderPointer,
                        render: ({ container }) => {
                            setState({
                                type: 'generate-safari-column-preview',
                                container,
                            });
                            return () => setState(idle);
                        },
                        nativeSetDragImage,
                    });
                },
                onDragStart: () => {
                    setIsDragging(true);
                },
                onDrop() {
                    setState(idle);
                    setIsDragging(false);
                },
            }),
            dropTargetForElements({
                element: columnInnerRef.current,
                getData: () => ({ columnId }),
                canDrop: ({ source }) => {
                    return source.data.instanceId === instanceId && source.data.type === 'card';
                },
                getIsSticky: () => true,
                onDragEnter: () => setState(isCardOver),
                onDragLeave: () => setState(idle),
                onDragStart: () => setState(isCardOver),
                onDrop: () => setState(idle),
            }),
            dropTargetForElements({
                element: columnRef.current,
                canDrop: ({ source }) => {
                    return source.data.instanceId === instanceId && source.data.type === 'column';
                },
                getIsSticky: () => true,
                getData: ({ input, element }) => {
                    const data = {
                        columnId,
                    };
                    return attachClosestEdge(data, {
                        input,
                        element,
                        allowedEdges: ['left', 'right'],
                    });
                },
                onDragEnter: (args) => {
                    setState({
                        type: 'is-column-over',
                        closestEdge: extractClosestEdge(args.self.data),
                    });
                },
                onDrag: (args) => {
                    // skip react re-render if edge is not changing
                    setState((current) => {
                        const closestEdge: Edge | null = extractClosestEdge(args.self.data);
                        if (current.type === 'is-column-over' && current.closestEdge === closestEdge) {
                            return current;
                        }
                        return {
                            type: 'is-column-over',
                            closestEdge,
                        };
                    });
                },
                onDragLeave: () => {
                    setState(idle);
                },
                onDrop: () => {
                    setState(idle);
                },
            }),
            autoScrollForElements({
                element: scrollableRef.current,
                canScroll: ({ source }) =>
                    source.data.instanceId === instanceId && source.data.type === 'card',
            }),
        );
    }, [columnId, registerColumn, instanceId]);

    const stableItems = useRef(column.items);
    useEffect(() => {
        stableItems.current = column.items;
    }, [column.items]);

    const getCardIndex = useCallback((userId: string) => {
        return stableItems.current.findIndex((item) => item.userId === userId);
    }, []);

    const getNumCards = useCallback(() => {
        return stableItems.current.length;
    }, []);

    const contextValue: ColumnContextProps = useMemo(() => {
        return { columnId, getCardIndex, getNumCards };
    }, [columnId, getCardIndex, getNumCards]);

    return (
        <ColumnContext.Provider value={contextValue}>
            <div className={styles.stack} ref={columnInnerRef}>
                <div className={`${styles.stack} ${isDragging ? styles.isDragging : ''}`}>
                    <div
                        className={styles.columnHeader}
                        ref={headerRef}
                        data-testid={`column-header-${columnId}`}
                    >
                        <span className={styles.columnTitle} data-testid={`column-header-title-${columnId}`}>
                            {column.title}
                        </span>
                        {/* <ActionMenu /> */}
                    </div>
                    <div className={styles.scrollContainer} ref={scrollableRef}>
                        <div className={styles.cardList}>
                            {column.items.map((item) => (
                                <Card item={item} key={item.userId} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {state.type === 'is-column-over' && state.closestEdge && (
                <DropIndicator edge={state.closestEdge} gap="8px" />
            )}

            {/* {
                state.type === 'generate-safari-column-preview'
                    ? createPortal(<SafariColumnPreview column={column} />, state.container)
                    : null
            } */}
        </ColumnContext.Provider >

    );
});