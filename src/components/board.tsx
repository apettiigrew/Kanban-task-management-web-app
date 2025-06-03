"use client"

import '@/app/board.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBoardContext } from '@/providers/board-context-provider';
import { useCreateColumn } from '@/hooks/mutations/use-column-mutations';
import { useInvalidateColumns } from '@/hooks/mutations/use-column-mutations';
import { PlusCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { Column } from './column';
import { toast } from 'sonner';
import { FormError } from '@/lib/form-error-handler';

export function Board() {
    const { board } = useBoardContext();
    const [isAddingList, setIsAddingList] = useState(false);
    const [newListTitle, setNewListTitle] = useState('');
    const boardRef = useRef<HTMLDivElement>(null);

    // Get project ID from board
    const projectId = board.id;

    // Column invalidation utility
    const { invalidateByProject } = useInvalidateColumns();

    // Create column mutation with database persistence
    const createColumnMutation = useCreateColumn({
        onSuccess: (data) => {
            toast.success(`Column "${data.title}" created successfully`);
            setNewListTitle('');
            setIsAddingList(false);
            // Invalidate columns cache to refresh the board
            if (projectId) {
                invalidateByProject(projectId);
            }
        },
        onError: (error: FormError) => {
            toast.error(error.message || 'Failed to create column');
        },
        onFieldErrors: (errors) => {
            if (errors.title) {
                toast.error(errors.title);
            }
        }
    });

    const handleAddList = () => {
        const trimmedTitle = newListTitle.trim();
        
        if (!trimmedTitle) {
            toast.error('Column title cannot be empty');
            return;
        }

        if (!projectId) {
            toast.error('No project selected');
            return;
        }

        // Get the next order number based on existing columns
        const maxOrder = board.columns.length > 0 
            ? Math.max(...board.columns.map((_, index) => index)) 
            : 0;

        // Create column in database with TanStack Query
        createColumnMutation.mutate({
            title: trimmedTitle,
            projectId,
            order: maxOrder + 1
        });
    };

    return (
        <div
            ref={boardRef}
            className="min-h-screen bg-background pt-6 pb-16 transition-colors">
            <div className="px-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">{board.title}</h1>
                    {createColumnMutation.isPending && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>Creating column...</span>
                        </div>
                    )}
                </div>

                <div className="flex items-start gap-4 overflow-x-auto pb-8 min-h-[calc(100vh-200px)] snap-x snap-mandatory">
                    {board.columns.map((column) => (
                        <Column
                            key={column.id}
                            title={column.title}
                            column={column} />
                    ))}

                    {isAddingList ? (
                        <NewListForm
                            newListTitle={newListTitle}
                            setNewListTitle={setNewListTitle}
                            handleAddList={handleAddList}
                            setIsAddingList={setIsAddingList}
                            isCreating={createColumnMutation.isPending}
                        />
                    ) : (
                        <AddListButton 
                            onClick={() => setIsAddingList(true)}
                            disabled={createColumnMutation.isPending}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

interface AddListButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export const AddListButton: React.FC<AddListButtonProps> = ({ onClick, disabled = false }) => {
    return (
        <div className="shrink-0">
            <Button
                variant="outline"
                className="border-dashed border-2 h-10 w-72 justify-start"
                onClick={onClick}
                disabled={disabled}
            >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add another list
            </Button>
        </div>
    );
};

interface NewListFormProps {
    newListTitle: string;
    setNewListTitle: (title: string) => void;
    handleAddList: () => void;
    setIsAddingList: (adding: boolean) => void;
    isCreating?: boolean;
}

export const NewListForm: React.FC<NewListFormProps> = ({
    newListTitle,
    setNewListTitle,
    handleAddList,
    setIsAddingList,
    isCreating = false,
}) => {
    return (
        <div className="w-72 shrink-0 bg-muted/40 p-2 rounded-md">
            <Input
                autoFocus
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="Enter list title..."
                className="mb-2"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddList();
                    if (e.key === 'Escape') setIsAddingList(false);
                }}
                disabled={isCreating}
            />
            <div className="flex gap-1">
                <Button
                    size="sm"
                    onClick={handleAddList}
                    disabled={!newListTitle.trim() || isCreating}
                >
                    {isCreating ? 'Creating...' : 'Add List'}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingList(false)}
                    disabled={isCreating}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
};