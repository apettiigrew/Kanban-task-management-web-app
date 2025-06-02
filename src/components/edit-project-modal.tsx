"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProjectForm } from "@/components/project-form"
import { useUpdateProject } from "@/hooks/queries/use-projects"
import { Project } from "@/types/project"
import { toast } from "sonner"

interface EditProjectModalProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProjectModal({ project, open, onOpenChange }: EditProjectModalProps) {
  const updateProjectMutation = useUpdateProject({
    onSuccess: () => {
      toast.success("Project updated successfully")
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update project")
    }
  })

  const handleSuccess = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <ProjectForm
          mode="update"
          projectId={project.id}
          defaultValues={{
            title: project.title,
            description: project.description || "",
            emoji: project.emoji
          }}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
} 