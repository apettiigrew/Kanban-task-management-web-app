"use client"

import '@/app/board.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBoardContext } from '@/providers/board-context-provider';
import { PlusCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { Column } from './column';

export function Board() {
    const { board, addList } = useBoardContext();
    const [isAddingList, setIsAddingList] = useState(false);
    const [newListTitle, setNewListTitle] = useState('');

    const boardRef = useRef<HTMLDivElement>(null);
    

    return (
        <div
            ref={boardRef}
            className="min-h-screen bg-background pt-6 pb-16 transition-colors">
            <div className="px-6">
                <h1 className="text-3xl font-bold mb-6">{board.title}</h1>

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
                            handleAddList={() => {
                                if (newListTitle.trim()) {
                                    addList(newListTitle.trim());
                                    setNewListTitle('');
                                    setIsAddingList(false);
                                }
                            }}
                            setIsAddingList={setIsAddingList}
                        />
                    ) : (
                        <AddListButton onClick={() => setIsAddingList(true)} />
                    )}
                </div>
            </div>
        </div>
    );
}

interface AddListButtonProps {
    onClick: () => void;
}

export const AddListButton: React.FC<AddListButtonProps> = ({ onClick }) => {
    return (
        <div className="shrink-0">
            <Button
                variant="outline"
                className="border-dashed border-2 h-10 w-72 justify-start"
                onClick={onClick}
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
}

export const NewListForm: React.FC<NewListFormProps> = ({
    newListTitle,
    setNewListTitle,
    handleAddList,
    setIsAddingList,
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
            />
            <div className="flex gap-1">
                <Button
                    size="sm"
                    onClick={handleAddList}
                    disabled={!newListTitle.trim()}
                >
                    Add List
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingList(false)}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
};