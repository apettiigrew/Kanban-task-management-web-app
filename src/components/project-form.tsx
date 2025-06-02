"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCreateProject, useUpdateProject } from "@/hooks/queries/use-projects"
import { createProjectSchema, updateProjectSchema, type CreateProject, type UpdateProject } from "@/lib/validations/project"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Textarea } from "./ui/textarea"

interface ProjectFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  defaultValues?: Partial<CreateProject>
  mode?: 'create' | 'update'
  projectId?: string
}

export function ProjectForm({ 
  onSuccess, 
  onCancel, 
  defaultValues,
  mode = 'create',
  projectId
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<CreateProject | UpdateProject>({
    resolver: zodResolver(mode === 'create' ? createProjectSchema : updateProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      emoji: "📋",
      ...defaultValues
    }
  })

  const createProjectMutation = useCreateProject({
    onSuccess: (data) => {
      toast.success("Project created successfully")
      reset()
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create project")
    }
  })

  const updateProjectMutation = useUpdateProject({
    onSuccess: (data) => {
      toast.success("Project updated successfully")
      reset()
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update project")
    }
  })

  const onSubmit = async (data: CreateProject | UpdateProject) => {
    try {
      if (mode === 'create') {
        toast.loading("Creating project...", { id: 'project-create' })
        await createProjectMutation.mutateAsync(data as CreateProject)
        toast.dismiss('project-create')
      } else if (mode === 'update' && projectId) {
        toast.loading("Updating project...", { id: 'project-update' })
        await updateProjectMutation.mutateAsync({
          id: projectId,
          data: data as UpdateProject
        })
        toast.dismiss('project-update')
      }
    } catch (error) {
      if (mode === 'create') {
        toast.dismiss('project-create')
      } else {
        toast.dismiss('project-update')
      }
      console.error(`Failed to ${mode} project:`, error)
    }
  }

  const isLoading = isSubmitting || createProjectMutation.isPending || updateProjectMutation.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Project Title</Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="Enter project title"
          disabled={isLoading}
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="emoji">Emoji</Label>
        <Input
          id="emoji"
          {...register("emoji")}
          placeholder="📋"
          disabled={isLoading}
          maxLength={2}
          aria-invalid={!!errors.emoji}
        />
        {errors.emoji && (
          <p className="text-sm text-red-500">{errors.emoji.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Enter project description"
          disabled={isLoading}
          aria-invalid={!!errors.description}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {mode === 'create' ? 'Create Project' : 'Update Project'}
        </Button>
      </div>
    </form>
  )
} 