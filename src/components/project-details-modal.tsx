"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Target, Clock } from "lucide-react"
import { Project } from "@/types/project"

interface ProjectDetailsModalProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditProject?: (project: Project) => void
  onDeleteProject?: (projectId: number) => void
}

export function ProjectDetailsModal({
  project,
  open,
  onOpenChange,
  onEditProject,
  onDeleteProject,
}: ProjectDetailsModalProps) {
  if (!project) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Planning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && project.status !== "Completed"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{project.emoji}</span>
            <span>{project.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Progress */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
            </div>
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>

          {/* Tasks Count */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Tasks:</span>
            </div>
            <span className="font-medium">{project.tasks} tasks</span>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Due Date:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${isOverdue(project.dueDate) ? "text-red-600 dark:text-red-400" : ""}`}>
                {formatDate(project.dueDate)}
              </span>
              {isOverdue(project.dueDate) && (
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">Overdue</span>
                </div>
              )}
            </div>
          </div>

          {/* Project Stats */}
          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Project Overview
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {project.tasks}
                </div>
                <div className="text-xs text-gray-500">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {project.status === "Completed" ? "100%" : "0%"}
                </div>
                <div className="text-xs text-gray-500">Complete</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <div className="flex gap-2">
              {onEditProject && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onEditProject(project)
                    onOpenChange(false)
                  }}
                >
                  Edit Project
                </Button>
              )}
              <Button
                onClick={() => {
                  // TODO: Navigate to project board
                  console.log("Navigate to project board:", project.id)
                  onOpenChange(false)
                }}
              >
                Open Project
              </Button>
            </div>
            
            {onDeleteProject && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
                    onDeleteProject(project.id)
                    onOpenChange(false)
                  }
                }}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
