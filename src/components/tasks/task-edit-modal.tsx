'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContentWithoutClose,
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
import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import DOMPurify from 'dompurify'
import { TextIcon, Trash2, X } from 'lucide-react'
import { TaskDeleteDialog } from './task-delete-dialog'
import { Textarea } from '../ui/textarea'

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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
    immediatelyRender: false,
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

  // Sync textarea height with content
  const syncTextareaHeight = () => {
    if (textareaRef.current) {
      // Reset height to get minimal height
      textareaRef.current.style.height = '0px'
      
      // Get the actual content height needed
      const scrollHeight = textareaRef.current.scrollHeight
      
      // Get padding values
      const computedStyle = getComputedStyle(textareaRef.current)
      const paddingTop = parseInt(computedStyle.paddingTop)
      const paddingBottom = parseInt(computedStyle.paddingBottom)
      
      // Calculate minimum height for single line
      const lineHeight = parseInt(computedStyle.lineHeight) || parseInt(computedStyle.fontSize) * 1.2
      const minHeight = lineHeight + paddingTop + paddingBottom
      
      // Use the smaller of scrollHeight or calculated minimum for tight fit
      const finalHeight = Math.max(minHeight, scrollHeight)
      
      textareaRef.current.style.height = `${finalHeight}px`
    }
  }

  useEffect(() => {
    if (isEditingTitle && textareaRef.current) {
      syncTextareaHeight()
    }
  }, [isEditingTitle, title])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContentWithoutClose className="sm:max-w-[600px] top-20 translate-y-0 overflow-hidden">
        <DialogTitle className="sr-only">Edit Task</DialogTitle>
        <div className="flex flex-col gap-4 w-full max-w-full overflow-hidden">
          <div className="flex w-full max-w-full gap-4">
            <div className="flex-[1_1_auto] w-full max-w-full overflow-hidden">
              {true ? (
                <Textarea
                  className="w-full max-w-full break-all whitespace-break-spaces resize-none p-2 overflow-hidden"
                  {...form.register('title')}
                  ref={(el) => {
                    const { ref } = form.register('title');
                    if (typeof ref === 'function') ref(el);
                    textareaRef.current = el;
                    // Sync height when element is first set
                    if (el) {
                      setTimeout(() => syncTextareaHeight(), 0);
                    }
                  }}
                  autoFocus
                  onBlur={handleTitleBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  onInput={syncTextareaHeight}
                />
              ) : (
                <div
                  className="cursor-pointer p-2 w-full max-w-full break-words whitespace-pre-line overflow-hidden"
                  onClick={() => setIsEditingTitle(true)}>
                  <p className="w-full max-w-full break-words overflow-hidden">
                    {title}
                  </p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex-[1_1_auto] p-2 hover:bg-accent rounded-sm transition-colors max-h-[min-content]"
              aria-label="Close dialog">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </DialogContentWithoutClose>

      <TaskDeleteDialog
        card={card}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDeleted={onClose}
      />
    </Dialog>
  )
} 