'use client'

import React, { useState } from 'react'
import { useColumns } from '@/hooks/queries/use-columns'
import { useCreateColumn } from '@/hooks/mutations/use-column-mutations'
import { EnhancedColumnCard } from './enhanced-column-card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Plus, RefreshCw, AlertCircle } from 'lucide-react'
import { FormError } from '@/lib/form-error-handler'
import { toast } from 'sonner'

interface ColumnManagementDemoProps {
  projectId: string
  projectTitle?: string
}

export function ColumnManagementDemo({ projectId, projectTitle = 'Project' }: ColumnManagementDemoProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState('')

  // Fetch columns for the project with proper caching
  const { 
    data: columns = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useColumns({ projectId })

  // Create column mutation with optimistic updates
  const createColumnMutation = useCreateColumn({
    onSuccess: (data) => {
      toast.success(`Column "${data.title}" created successfully`)
      setNewColumnTitle('')
      setIsCreating(false)
    },
    onError: (error: FormError) => {
      toast.error(error.message || 'Failed to create column')
    },
    onFieldErrors: (errors) => {
      if (errors.title) {
        toast.error(errors.title)
      }
    }
  })

  const handleCreateColumn = () => {
    const trimmedTitle = newColumnTitle.trim()
    
    if (!trimmedTitle) {
      toast.error('Column title cannot be empty')
      return
    }

    // Get the next order number
    const maxOrder = columns.length > 0 ? Math.max(...columns.map(col => col.order)) : 0
    
    createColumnMutation.mutate({
      title: trimmedTitle,
      projectId,
      order: maxOrder + 1
    })
  }

  const handleTaskAdd = (columnId: string) => {
    // This would open a task creation modal/form
    // For now, just show a toast
    toast.info(`Task creation for column ${columnId} would open here`)
  }

  if (isError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Error Loading Columns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Failed to load columns'}
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Column Management</h2>
          <p className="text-muted-foreground">
            Managing columns for {projectTitle} • {columns.length} column{columns.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsCreating(!isCreating)} disabled={createColumnMutation.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        </div>
      </div>

      {/* Create Column Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Column</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter column title..."
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleCreateColumn()
                } else if (e.key === 'Escape') {
                  e.preventDefault()
                  setIsCreating(false)
                  setNewColumnTitle('')
                }
              }}
              disabled={createColumnMutation.isPending}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateColumn}
                disabled={createColumnMutation.isPending || !newColumnTitle.trim()}
              >
                {createColumnMutation.isPending ? 'Creating...' : 'Create Column'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsCreating(false)
                  setNewColumnTitle('')
                }}
                disabled={createColumnMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Column Grid */}
      {!isLoading && columns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {columns
            .sort((a, b) => a.order - b.order)
            .map((column) => (
              <EnhancedColumnCard
                key={column.id}
                column={column}
                projectId={projectId}
                onTaskAdd={handleTaskAdd}
                isLoading={false}
              />
            ))
          }
        </div>
      )}

      {/* Empty State */}
      {!isLoading && columns.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No columns yet</h3>
                <p className="text-muted-foreground">
                  Get started by creating your first column for this project.
                </p>
              </div>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Column
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading indicator for mutations */}
      {createColumnMutation.isPending && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Creating column...</span>
        </div>
      )}
    </div>
  )
} 