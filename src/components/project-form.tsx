"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCreateProject } from "@/hooks/queries/use-projects"
import { createProjectSchema, type CreateProject } from "@/lib/validations/project"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ProjectFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  defaultValues?: Partial<CreateProject>
}

export function ProjectForm({ onSuccess, onCancel, defaultValues }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<CreateProject>({
    resolver: zodResolver(createProjectSchema),
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

  const onSubmit = async (data: CreateProject) => {
    try {
      await createProjectMutation.mutateAsync(data)
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error("Failed to create project:", error)
    }
  }

  const isLoading = isSubmitting || createProjectMutation.isPending

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
          Create Project
        </Button>
      </div>
    </form>
  )
} 