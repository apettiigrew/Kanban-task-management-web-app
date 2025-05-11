import ReactDOM from "react-dom";
import { CardPrimitive } from "./card-primitive";
import { attachClosestEdge, extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/dist/types/closest-edge";
import { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/dist/types/types";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/dist/types/adapter/element-adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/dist/types/entry-point/element/set-custom-native-drag-preview";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/dist/types/public-utils/combine";
import { memo, useRef, useState, useEffect, Fragment } from "react";
import invariant from "tiny-invariant";
import { Person } from ".";
import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source';
import { useBoardContext } from "./board-context";
import { dropTargetForExternal } from '@atlaskit/pragmatic-drag-and-drop/external/adapter';
import styles from "./card.module.scss";
export type State =
    | { type: 'idle' }
    | { type: 'preview'; container: HTMLElement; rect: DOMRect }
    | { type: 'dragging' };

const idleState: State = { type: 'idle' };
const draggingState: State = { type: 'dragging' };


type PreviewBoxProps = {
    width: number;
    height: number;
    children?: React.ReactNode;
};

function PreviewBox({ width, height, children }: PreviewBoxProps) {
    return (
        <div
            className={styles.previewBox}
            style={{ width, height }}
            data-testid="preview-box"
        >
            {children}
        </div>
    );
}


export const Card = memo(function Card({ item }: { item: Person }) {
    const ref = useRef<HTMLDivElement | null>(null);
    const { userId } = item;
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
    const [state, setState] = useState<State>(idleState);

    const actionMenuTriggerRef = useRef<HTMLButtonElement>(null);
    const { instanceId, registerCard } = useBoardContext();
    useEffect(() => {
        invariant(actionMenuTriggerRef.current);
        invariant(ref.current);
        return registerCard({
            cardId: userId,
            entry: {
                element: ref.current,
                actionMenuTrigger: actionMenuTriggerRef.current,
            },
        });
    }, [registerCard, userId]);

    useEffect(() => {
        const element = ref.current;
        invariant(element);
        return combine(
            draggable({
                element: element,
                getInitialData: () => ({ type: 'card', itemId: userId, instanceId }),
                onGenerateDragPreview: ({ location, source, nativeSetDragImage }) => {
                    const rect = source.element.getBoundingClientRect();

                    setCustomNativeDragPreview({
                        nativeSetDragImage,
                        getOffset: preserveOffsetOnSource({
                            element,
                            input: location.current.input,
                        }),
                        render({ container }) {
                            setState({ type: 'preview', container, rect });
                            return () => setState(draggingState);
                        },
                    });
                },

                onDragStart: () => setState(draggingState),
                onDrop: () => setState(idleState),
            }),
            dropTargetForExternal({
                element: element,
            }),
            dropTargetForElements({
                element: element,
                canDrop: ({ source }) => {
                    return source.data.instanceId === instanceId && source.data.type === 'card';
                },
                getIsSticky: () => true,
                getData: ({ input, element }) => {
                    const data = { type: 'card', itemId: userId };

                    return attachClosestEdge(data, {
                        input,
                        element,
                        allowedEdges: ['top', 'bottom'],
                    });
                },
                onDragEnter: (args) => {
                    if (args.source.data.itemId !== userId) {
                        setClosestEdge(extractClosestEdge(args.self.data));
                    }
                },
                onDrag: (args) => {
                    if (args.source.data.itemId !== userId) {
                        setClosestEdge(extractClosestEdge(args.self.data));
                    }
                },
                onDragLeave: () => {
                    setClosestEdge(null);
                },
                onDrop: () => {
                    setClosestEdge(null);
                },
            }),
        );
    }, [instanceId, item, userId]);

    return (
        <Fragment>
            <CardPrimitive
                ref={ref}
                item={item}
                state={state}
                closestEdge={closestEdge}
            />
            {state.type === 'preview' &&
                ReactDOM.createPortal(
                    <PreviewBox
                        width={state.rect.width}
                        height={state.rect.height}>
                        <CardPrimitive
                            item={item}
                            state={state}
                            closestEdge={null}
                        />
                    </PreviewBox>
                    ,
                    state.container
                )}
        </Fragment>
    );
});