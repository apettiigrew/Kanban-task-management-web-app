'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useUpdateTask } from '@/hooks/mutations/use-task-mutations'
import { FormError } from '@/lib/form-error-handler'
import { updateTaskSchema } from '@/lib/validations/task'
import { TCard } from '@/utils/data'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import DOMPurify from 'dompurify'
import { TextIcon, Trash2 } from 'lucide-react'
import { TaskDeleteDialog } from './task-delete-dialog'

interface TaskEditModalProps {
  card: TCard
  isOpen: boolean
  onClose: () => void
}

interface EditorToolbarProps {
  editor: any
}



// MenuBar for Tiptap formatting
const MenuBar = ({ editor }: EditorToolbarProps) => {
  if (!editor) return null
  return (
    <div className="flex flex-wrap gap-2 p-2 pb-0">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-accent transition-colors ${editor.isActive('bold') ? 'bg-primary text-primary-foreground' : ''}`}
        aria-label="Bold"
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-accent transition-colors ${editor.isActive('italic') ? 'bg-primary text-primary-foreground' : ''}`}
        aria-label="Italic"
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-accent transition-colors ${editor.isActive('strike') ? 'bg-primary text-primary-foreground' : ''}`}
        aria-label="Strike"
      >
        Strike
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-accent transition-colors ${editor.isActive('code') ? 'bg-primary text-primary-foreground' : ''}`}
        aria-label="Code"
      >
        Code
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        className="rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-accent transition-colors"
        aria-label="Clear marks"
      >
        Clear marks
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().clearNodes().run()}
        className="rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-accent transition-colors"
        aria-label="Clear nodes"
      >
        Clear nodes
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-accent transition-colors ${editor.isActive('paragraph') ? 'bg-primary text-primary-foreground' : ''}`}
        aria-label="Paragraph"
      >
        Paragraph
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-accent transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-primary text-primary-foreground' : ''}`}
        aria-label="H1"
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-accent transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-primary-foreground' : ''}`}
        aria-label="H2"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-accent transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-primary text-primary-foreground' : ''}`}
        aria-label="H3"
      >
        H3
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={`rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-accent transition-colors ${editor.isActive('heading', { level: 4 }) ? 'bg-primary text-primary-foreground' : ''}`}
        aria-label="H4"
      >
        H4
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        className={`rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-accent transition-colors ${editor.isActive('heading', { level: 5 }) ? 'bg-primary text-primary-foreground' : ''}`}
        aria-label="H5"
      >
        H5
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
        className={`rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-accent transition-colors ${editor.isActive('heading', { level: 6 }) ? 'bg-primary text-primary-foreground' : ''}`}
        aria-label="H6"
      >
        H6
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-accent transition-colors ${editor.isActive('bulletList') ? 'bg-primary text-primary-foreground' : ''}`}
        aria-label="Bullet list"
      >
        Bullet list
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-accent transition-colors ${editor.isActive('orderedList') ? 'bg-primary text-primary-foreground' : ''}`}
        aria-label="Ordered list"
      >
        Ordered list
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-accent transition-colors ${editor.isActive('codeBlock') ? 'bg-primary text-primary-foreground' : ''}`}
        aria-label="Code block"
      >
        Code block
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-accent transition-colors ${editor.isActive('blockquote') ? 'bg-primary text-primary-foreground' : ''}`}
        aria-label="Blockquote"
      >
        Blockquote
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-accent transition-colors"
        aria-label="Horizontal rule"
      >
        Horizontal rule
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHardBreak().run()}
        className="rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-accent transition-colors"
        aria-label="Hard break"
      >
        Hard break
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className="rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-accent transition-colors"
        aria-label="Undo"
      >
        Undo
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className="rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-accent transition-colors"
        aria-label="Redo"
      >
        Redo
      </button>
    </div>
  )
}

export function TaskEditModal({ card, isOpen, onClose }: TaskEditModalProps) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: card.title,
      description: card.description || '',
    },
  })

  const updateTaskMutation = useUpdateTask({
    onSuccess: (updatedCard) => {
      setIsEditingTitle(false)
      setIsEditingDescription(false)
      setTitle(updatedCard.title)
    },
    onError: (error: FormError) => {
      setTitle(card.title)
      form.setValue('title', card.title)
      toast.error(error.message || 'Failed to update task')
    },
  })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
    ],
    content: card.description || '',
    editorProps: {
      attributes: {
        spellcheck: 'false',
      },
    },
    onUpdate: ({ editor }) => {
      form.setValue('description', editor.getHTML())
    },
  })

  const handleTitleBlur = async () => {
    let newTitle = form.getValues('title')
    newTitle = newTitle?.trim()

    if (newTitle === card.title) {
      setIsEditingTitle(false)
      return
    }

    if (!newTitle?.trim()) {
      form.setValue('title', card.title)
      setTitle(card.title)
      setIsEditingTitle(false)
      return
    }

    setTitle(newTitle)

    updateTaskMutation.mutate({
      id: card.id as string,
      title: newTitle,
      description: card.description || null,
      columnId: card.columnId,
      order: card.order,
      projectId: card.projectId,
    })

    setIsEditingTitle(false)
  }

  const handleDescriptionSave = async () => {
    const description = form.getValues('description')
    if (description !== card.description) {
      updateTaskMutation.mutate({
        id: card.id as string,
        title: card.title,
        description: description,
        columnId: card.columnId,
        order: card.order,
        projectId: card.projectId,
      })
    }
    setIsEditingDescription(false)
  }

  const handleDescriptionCancel = () => {
    form.setValue('description', card.description || '')
    editor?.commands.setContent(card.description || '')
    setIsEditingDescription(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] top-20 translate-y-0 overflow-hidden">
        <DialogTitle className="sr-only">Edit Task</DialogTitle>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {isEditingTitle ? (
              <Input
                className="w-[90%] break-all overflow-wrap-anywhere"
                {...form.register('title')}
                autoFocus
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur()
                  }
                }}
              />
            ) : (
              <div
                className="cursor-pointer p-2 break-all overflow-wrap-anywhere"
                onClick={() => setIsEditingTitle(true)}
              >
                {title}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            aria-label="Delete card"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className='flex items-center gap-2'>
              <TextIcon className="h-4 w-4 text-gray-500" />
              <label className="text-sm font-medium">Description</label>
            </div>

            {isEditingDescription ? (
              <div className="space-y-2">
                <div className="bg-background rounded-md">
                  <MenuBar editor={editor} />
                  <div className="min-h-[200px] p-4">
                    <EditorContent
                      editor={editor}
                      className="prose prose-sm max-w-none dark:prose-invert focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:border-none [&_.ProseMirror]:break-all [&_.ProseMirror]:overflow-wrap-anywhere bg-background"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleDescriptionCancel}
                    disabled={updateTaskMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDescriptionSave}
                    disabled={updateTaskMutation.isPending}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="cursor-pointer rounded-md border border-transparent p-2 hover:border-border transition-opacity duration-200 hover:opacity-70 focus-within:opacity-70"
                onClick={() => setIsEditingDescription(true)}
                tabIndex={0}
                aria-label="Edit description"
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setIsEditingDescription(true) }}
              >
                {card.description ? (
                  <div
                    className="prose prose-sm max-w-none ProseMirror break-all overflow-wrap-anywhere"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(card.description) }}
                  />
                ) : (
                  <p className="text-muted-foreground">Add a description...</p>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      <TaskDeleteDialog
        card={card}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDeleted={onClose}
      />
    </Dialog>
  )
} 