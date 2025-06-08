'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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

interface TaskEditModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
}

export function TaskEditModal({ task, isOpen, onClose }: TaskEditModalProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || '',
    },
  })

  const updateTaskMutation = useUpdateTask({
    onSuccess: () => {
      setIsEditingTitle(false)
      setIsEditingDescription(false)
    
      // replace optimistic task with real data in all caches
    },
    onError: (error: FormError) => {
      toast.error(error.message || 'Failed to update task')
    },
  })

  const editor = useEditor({
    extensions: [StarterKit],
    content: task.description || '',
    onUpdate: ({ editor }) => {
      form.setValue('description', editor.getHTML())
    },
  })

  const handleTitleBlur = async () => {
    let title = form.getValues('title')
    title = title?.trim()

    if (title === task.title) {
      setIsEditingTitle(false)
      return
    }

    if (!title?.trim()) {
      form.setValue('title', task.title)
      setIsEditingTitle(false)
      return
    }


    // add optimisitic updates of task here


    updateTaskMutation.mutate({
      id: task.id,
      title,
      description: task.description || null,
      columnId: task.columnId,
      order: task.order,
      projectId: task.projectId,
    })

    setIsEditingTitle(false)
  }

  const handleDescriptionSave = async () => {
    const description = form.getValues('description')
    if (description !== task.description) {
      updateTaskMutation.mutate({
        id: task.id,
        data: { description },
      })
    }
    setIsEditingDescription(false)
  }

  const handleDescriptionCancel = () => {
    form.setValue('description', task.description || '')
    editor?.commands.setContent(task.description || '')
    setIsEditingDescription(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
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
                {task.title}
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
                {task.description ? (
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: task.description }}
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