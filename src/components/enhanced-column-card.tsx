'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useUpdateColumn, useDeleteColumn } from '@/hooks/mutations/use-column-mutations'
import { Column } from '@/types/column'
import { Card, CardContent, CardHeader } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from './ui/dropdown-menu'
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
} from './ui/alert-dialog'
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Plus,
  Users,
  Clock,
  Check,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormError } from '@/lib/form-error-handler'
import { toast } from 'sonner'

interface EnhancedColumnCardProps {
  column: Column & { taskCount: number }
  projectId: string
  className?: string
  onTaskAdd?: (columnId: string) => void
  isLoading?: boolean
}

export function EnhancedColumnCard({ 
  column, 
  projectId, 
  className, 
  onTaskAdd,
  isLoading = false 
}: EnhancedColumnCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(column.title)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const updateColumnMutation = useUpdateColumn({
    onSuccess: (data) => {
      toast.success('Column updated successfully')
      setIsEditingTitle(false)
    },
    onError: (error: FormError) => {
      toast.error(error.message || 'Failed to update column')
      // Reset title on error
      setEditTitle(column.title)
      setIsEditingTitle(false)
    },
    onFieldErrors: (errors) => {
      if (errors.title) {
        toast.error(errors.title)
      }
    }
  })

  const deleteColumnMutation = useDeleteColumn({
    onSuccess: () => {
      toast.success('Column deleted successfully')
      setShowDeleteDialog(false)
    },
    onError: (error: FormError) => {
      toast.error(error.message || 'Failed to delete column')
      setShowDeleteDialog(false)
    }
  })

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditingTitle])

  const handleTitleSave = async () => {
    const trimmedTitle = editTitle.trim()
    
    if (!trimmedTitle) {
      toast.error('Column title cannot be empty')
      setEditTitle(column.title)
      setIsEditingTitle(false)
      return
    }

    if (trimmedTitle === column.title) {
      setIsEditingTitle(false)
      return
    }

    updateColumnMutation.mutate({
      id: column.id,
      data: { title: trimmedTitle }
    })
  }

  const handleTitleCancel = () => {
    setEditTitle(column.title)
    setIsEditingTitle(false)
  }

  const handleDelete = () => {
    if (column.taskCount > 0) {
      toast.error('Cannot delete column with tasks. Please move or delete all tasks first.')
      setShowDeleteDialog(false)
      return
    }
    
    deleteColumnMutation.mutate(column.id)
  }

  const handleTaskAdd = () => {
    if (onTaskAdd) {
      onTaskAdd(column.id)
    }
  }

  // Determine column status badge
  const getStatusBadge = () => {
    if (column.taskCount === 0) {
      return <Badge variant="secondary" className="text-xs">Empty</Badge>
    }
    
    return (
      <Badge variant="outline" className="text-xs">
        <Users className="h-3 w-3 mr-1" />
        {column.taskCount} {column.taskCount === 1 ? 'task' : 'tasks'}
      </Badge>
    )
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  const isUpdating = updateColumnMutation.isPending
  const isDeleting = deleteColumnMutation.isPending

  return (
    <Card className={cn(
      "w-full max-w-sm transition-all duration-200",
      "hover:shadow-md hover:scale-[1.02]",
      "border-l-4 border-l-blue-500",
      (isUpdating || isDeleting || isLoading) && "opacity-60 pointer-events-none",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <div className="space-y-2">
                <Input
                  ref={titleInputRef}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleTitleSave()
                    } else if (e.key === 'Escape') {
                      e.preventDefault()
                      handleTitleCancel()
                    }
                  }}
                  onBlur={handleTitleSave}
                  className="text-lg font-semibold"
                  placeholder="Enter column title..."
                  disabled={isUpdating}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleTitleSave}
                    disabled={isUpdating}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleTitleCancel}
                    disabled={isUpdating}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <h3 
                className="text-lg font-semibold truncate cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => setIsEditingTitle(true)}
                title={column.title}
              >
                {column.title}
              </h3>
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
                <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit title
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleTaskAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add task
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
                        Are you sure you want to delete "{column.title}"? 
                        {column.taskCount > 0 && (
                          <span className="block mt-2 text-red-600 font-medium">
                            This column contains {column.taskCount} task{column.taskCount !== 1 ? 's' : ''}. 
                            Please move or delete all tasks before deleting the column.
                          </span>
                        )}
                        {column.taskCount === 0 && (
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
                        disabled={column.taskCount > 0 || isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {getStatusBadge()}
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {formatDate(column.updatedAt)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Order: {column.order}</span>
            <span>ID: {column.id.slice(-8)}</span>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleTaskAdd}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>

          {(isUpdating || isDeleting || isLoading) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>
                {isUpdating && 'Updating...'}
                {isDeleting && 'Deleting...'}
                {isLoading && 'Loading...'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 