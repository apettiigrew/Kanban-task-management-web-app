"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Project } from "@/types/project"

interface AddProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddProject: (project: Omit<Project, "id">) => Promise<void>
  loading?: boolean
}

const statusOptions = ["Not Started", "Planning", "In Progress", "Completed"]
const emojiOptions = ["🚀", "💻", "📣", "🎯", "🔬", "🤝", "🏝️", "💰", "📱", "📝", "🧪", "📊", "🏗️", "✨", "🔥", "⭐", "🎨", "🔧", "📈", "🎪"]

export function AddProjectModal({ open, onOpenChange, onAddProject, loading = false }: AddProjectModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    emoji: "🚀",
    tasks: 0,
    status: "Not Started" as Project["status"],
    dueDate: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await onAddProject({
        name: formData.name.trim(),
        emoji: formData.emoji,
        tasks: formData.tasks,
        status: formData.status,
        dueDate: formData.dueDate,
      })

      // Reset form
      setFormData({
        name: "",
        emoji: "🚀",
        tasks: 0,
        status: "Not Started",
        dueDate: "",
      })

      onOpenChange(false)
    } catch (error) {
      // Error handling is done in the context
      console.error("Failed to add project:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emoji">Emoji</Label>
            <Select 
              value={formData.emoji} 
              onValueChange={(value) => handleInputChange("emoji", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {emojiOptions.map((emoji) => (
                  <SelectItem key={emoji} value={emoji}>
                    <span className="text-lg">{emoji}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => handleInputChange("status", value as Project["status"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tasks">Initial Tasks Count</Label>
            <Input
              id="tasks"
              type="number"
              min="0"
              value={formData.tasks}
              onChange={(e) => handleInputChange("tasks", parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
