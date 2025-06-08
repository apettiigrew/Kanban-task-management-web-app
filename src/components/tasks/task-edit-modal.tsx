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
import { Task, updateTaskSchema } from '@/lib/validations/task'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { ProjectWithColumnsAndTasks, TCard } from '@/utils/data'

interface TaskEditModalProps {
  card: TCard
  isOpen: boolean
  onClose: () => void
}

export function TaskEditModal({ card, isOpen, onClose }: TaskEditModalProps) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
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
    extensions: [StarterKit],
    content: card.description || '',
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

    console.log({
      id: card.id,
      title: newTitle,
      description: card.description || null,
      columnId: card.columnId,
      order: card.order,
      projectId: card.projectId,
    })

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
      <DialogContent className="sm:max-w-[600px]">
        <DialogTitle className="sr-only">Edit Task</DialogTitle>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {isEditingTitle ? (
              <Input
                className="w-[90%]"
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
                className="cursor-pointer p-2"
                onClick={() => setIsEditingTitle(true)}
              >
                {title}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4 py-4">
          {/* Description Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            {isEditingDescription ? (
              <div className="space-y-2">
                <div className="min-h-[200px] rounded-md border p-2">
                  <EditorContent editor={editor} className="prose prose-sm max-w-none dark:prose-invert" />
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
                className="cursor-pointer rounded-md border border-transparent p-2 hover:border-border"
                onClick={() => setIsEditingDescription(true)}
              >
                {card.description ? (
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: card.description }}
                  />
                ) : (
                  <p className="text-muted-foreground">Add a description...</p>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 