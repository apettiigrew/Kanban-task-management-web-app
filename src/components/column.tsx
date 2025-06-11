import { SettingsContext } from '@/providers/settings-context';
import { useUpdateColumn, useDeleteColumn } from '@/hooks/mutations/use-column-mutations';
import { useInvalidateProject, useInvalidateProjects } from '@/hooks/queries/use-projects';
import { getColumnData, isCardData, isCardDropTargetData, isColumnData, isDraggingACard, isDraggingAColumn, isShallowEqual, TCard, TCardData, TColumn } from '@/utils/data';
import { cc } from '@/utils/style-utils';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { unsafeOverflowAutoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element';
import {
    attachClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { DragLocationHistory } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types';
import {
    draggable,
    dropTargetForElements
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { X, MoreHorizontal, Trash2 } from 'lucide-react';
import { useContext, useEffect, useRef, useState } from 'react';
import { Input } from './ui/input';
import { ColumnWrapper } from './column-wrapper';
import { Button } from './ui/button';
import { CardShadow, CardTask } from './card';
import { toast } from 'sonner';
import { FormError } from '@/lib/form-error-handler';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { useCreateTask } from '@/hooks/mutations/use-task-mutations';

type TColumnState =
    | { type: 'is-card-over'; isOverChildCard: boolean; dragging: DOMRect }
    | { type: 'is-column-over' }
    | { type: 'idle' }
    | { type: 'is-dragging' };

const idle = { type: 'idle' } satisfies TColumnState;

const stateStyles: { [Key in TColumnState['type']]: string } = {
    idle: '',
    'is-card-over': 'border-2 border-emerald-500 bg-emerald-50 shadow-lg scale-[1.02] transition-all',
    'is-dragging': 'opacity-60 rotate-2 shadow-2xl transition-all',
    'is-column-over': 'border-2 border-purple-500 bg-purple-50 shadow-lg scale-[1.02] transition-all',
};

interface ColumnProps {
    title: string;
    column: TColumn;
}
export function Column({ title, column }: ColumnProps) {
    
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [columnTitle, setColumnTitle] = useState(title);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const outerFullHeightRef = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const newCardInputRef = useRef<HTMLInputElement>(null);
    const scrollableRef = useRef<HTMLDivElement | null>(null);
    
    const [state, setState] = useState<TColumnState>(idle);
    const { settings } = useContext(SettingsContext);

    // Get project ID from board
    const projectId = column.projectId;

    // Column invalidation utility
    const { invalidateByProject } = useInvalidateProject();

    // Project invalidation utility
    const invalidateProjects = useInvalidateProjects();

    const createTaskMutation = useCreateTask({
        onError: (error: FormError) => {
            toast.error(error.message || 'Failed to create task');
        }
    });

    // Update column mutation with optimistic updates
    const updateColumnMutation = useUpdateColumn({
        onSuccess: (data) => {
            toast.success('Column title updated successfully');
            // Invalidate both columns and project cache to refresh the board
            if (projectId) {
                invalidateByProject(projectId);
                invalidateProjects(); // This will refresh the board context
            }
        },
        onError: (error: FormError) => {
            toast.error(error.message || 'Failed to update column title');
            // Reset title on error (rollback optimistic update)
            setColumnTitle(title);
        },
        onFieldErrors: (errors) => {
            if (errors.title) {
                toast.error(errors.title);
            }
            // Reset title on validation error (rollback optimistic update)
            setColumnTitle(title);
        }
    });

    // Delete column mutation
    const deleteColumnMutation = useDeleteColumn({
        onSuccess: () => {
            toast.success(`Column "${title}" deleted successfully`);
            setShowDeleteDialog(false);
            // Invalidate both columns and project cache to refresh the board
            if (projectId) {
                invalidateByProject(projectId);
                invalidateProjects(); // This will refresh the board context
            }
        },
        onError: (error: FormError) => {
            toast.error(error.message || 'Failed to delete column');
        }
    });

    // Update column title when prop changes (for real-time sync)
    useEffect(() => {
        setColumnTitle(title);
    }, [title]);

    const handleTitleSave = () => {
        const trimmedTitle = columnTitle.trim();

        if (!trimmedTitle) {
            toast.error('Column title cannot be empty');
            setColumnTitle(title); // Reset to original title
            setIsEditingTitle(false);
            return;
        }

        if (trimmedTitle === title) {
            setIsEditingTitle(false);
            return;
        }

        if (!projectId) {
            toast.error('No project selected');
            setColumnTitle(title); // Reset to original title
            setIsEditingTitle(false);
            return;
        }

        updateColumnMutation.mutate({
            id: column.id,
            data: { title: trimmedTitle }
        });

        setIsEditingTitle(false);
    };

    const handleTitleCancel = () => {
        setColumnTitle(title); // Reset to original title
        setIsEditingTitle(false);
    };

    const handleDelete = () => {
        if (column.cards && column.cards.length > 0) {
            toast.error('Cannot delete column with tasks. Please move or delete all tasks first.');
            return;
        }

        deleteColumnMutation.mutate(column.id);
    };

    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [isEditingTitle]);

    useEffect(() => {
        if (isAddingCard && newCardInputRef.current) {
            newCardInputRef.current.focus();
        }
    }, [isAddingCard]);

    useEffect(() => {
        const outer = outerFullHeightRef.current;
        const scrollable = scrollableRef.current;
        if (!outer || !scrollable) return;

        const data = getColumnData({ column });

        function setIsCardOver({ data, location }: { data: TCardData; location: DragLocationHistory }) {
            const innerMost = location.current.dropTargets[0];
            const isOverChildCard = Boolean(innerMost && isCardDropTargetData(innerMost.data));

            const proposed: TColumnState = {
                type: 'is-card-over',
                dragging: data.rect,
                isOverChildCard,
            };
            setState((current) => (isShallowEqual(proposed, current) ? current : proposed));
        }

        return combine(
            draggable({
                element: outer,
                getInitialData: () => data,
                onDragStart: () => setState({ type: 'is-dragging' }),
                onDrop: () => setState(idle),
            }),
            dropTargetForElements({
                element: outer,
                getData: ({ input, element }) => attachClosestEdge(data, { element, input, allowedEdges: ['left', 'right'] }),
                canDrop: ({ source }) => isDraggingACard({ source }) || isDraggingAColumn({ source }),
                getIsSticky: () => true,
                onDragStart: ({ source, location }) => isCardData(source.data) && setIsCardOver({ data: source.data, location }),
                onDragEnter: ({ source, location }) => {
                    if (isCardData(source.data)) return setIsCardOver({ data: source.data, location });
                    if (isColumnData(source.data) && source.data.column.id !== column.id) setState({ type: 'is-column-over' });
                },
                onDropTargetChange: ({ source, location }) => isCardData(source.data) && setIsCardOver({ data: source.data, location }),
                onDragLeave: ({ source }) => !isColumnData(source.data) || source.data.column.id !== column.id ? setState(idle) : undefined,
                onDrop: () => setState(idle),
            }),
            autoScrollForElements({
                canScroll: ({ source }) => settings.isOverElementAutoScrollEnabled && isDraggingACard({ source }),
                getConfiguration: () => ({ maxScrollSpeed: settings.columnScrollSpeed }),
                element: scrollable,
            }),
            unsafeOverflowAutoScrollForElements({
                element: scrollable,
                getConfiguration: () => ({ maxScrollSpeed: settings.columnScrollSpeed }),
                canScroll: ({ source }) =>
                    settings.isOverElementAutoScrollEnabled &&
                    settings.isOverflowScrollingEnabled &&
                    isDraggingACard({ source }),
                getOverflow: () => ({ forTopEdge: { top: 1000 }, forBottomEdge: { bottom: 1000 } }),
            })
        );
    }, [column, column.cards, settings]);

    const addCard = (columnId: string, title: string) => {
        setIsAddingCard(false); 
        setNewCardTitle('');
        createTaskMutation.mutate({ 
            projectId: column.projectId,
            columnId: columnId,
            title: title,
            order: column.cards.length,
        });
    }

    return (
        <ColumnWrapper
            className={cc(
                'bg-gray-50 text-gray-900 rounded-2xl p-4 border border-gray-200 max-w-[260px] w-full max-h-[calc(100vh-160px)] flex flex-col gap-4',
                stateStyles[state.type]
            )}
            ref={outerFullHeightRef}
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 flex-1">
                    {isEditingTitle ? (
                        <Input
                            ref={titleInputRef}
                            className="text-sm font-semibold text-gray-500"
                            value={columnTitle}
                            onChange={(e) => setColumnTitle(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleTitleSave();
                                } else if (e.key === 'Escape') {
                                    e.preventDefault();
                                    handleTitleCancel();
                                }
                            }}
                            placeholder="Enter column title..."
                        />
                    ) : (
                        <h2
                            onClick={() => setIsEditingTitle(true)}
                            className="text-sm font-semibold text-black-500 cursor-pointer hover:text-gray-700 transition-colors flex-1"
                            title="Click to edit title"
                        >
                            {columnTitle}
                        </h2>
                    )}
                </div>

                {!isEditingTitle && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open column menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="center">
                                List actions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600"
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete column
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Column</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete "{columnTitle}"?
                                            {column.cards && column.cards.length > 0 ? (
                                                <span className="block mt-2 text-red-600 font-medium">
                                                    This column contains {column.cards.length} task{column.cards.length !== 1 ? 's' : ''}.
                                                    Please move or delete all tasks before deleting the column.
                                                </span>
                                            ) : (
                                                <span className="block mt-2">
                                                    This action cannot be undone.
                                                </span>
                                            )}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            disabled={column.cards && column.cards.length > 0 || deleteColumnMutation.isPending}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            {deleteColumnMutation.isPending ? 'Deleting...' : 'Delete'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto flex-grow max-h-screen min-h-0" ref={scrollableRef}>
                <DisplayCard columnId={column.id} cards={column.cards} state={state} />
            </div>
            <div>
                {isAddingCard ? (
                    <div className="flex flex-col gap-2">
                        <Input
                            ref={newCardInputRef}
                            className="text-sm font-medium"
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') addCard(column.id, newCardTitle.trim());
                                if (e.key === 'Escape') setIsAddingCard(false);
                            }}
                            placeholder="Enter a title or paste a link"
                        />
                        <div className="flex justify-between gap-3">
                            <Button onClick={() => addCard(column.id, newCardTitle.trim())}>
                                Add card
                            </Button>
                            <Button
                                onClick={() => setIsAddingCard(false)}
                                variant="ghost"
                                size="sm"
                                aria-label="Cancel adding card"
                            >
                                <X />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 text-white"
                        onClick={() => setIsAddingCard(true)}
                    >
                        Add a card
                    </Button>
                )}
            </div>
        </ColumnWrapper>
    );
}

interface DisplayCardProps {
    cards: TCard[];
    columnId: string;
    state: TColumnState;
}
function DisplayCard({ cards, columnId, state }: DisplayCardProps) {
    if (!cards || cards.length === 0) {
        return state.type === 'is-card-over' ? <CardShadow dragging={state.dragging} /> : null;
    }

    return (
        <>
            {cards.map((card) => (
                <CardTask card={card} key={card.id} columnId={columnId} />
            ))}
        </>
    );
}