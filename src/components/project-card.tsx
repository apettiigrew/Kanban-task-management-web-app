"use client"

import { Grid } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Project } from "@/types/project"

interface ProjectCardProps {
  project: Project
  onViewProject?: (projectId: number) => void
}

export function ProjectCard({ project, onViewProject }: ProjectCardProps) {
  const getStatusVariant = (status: Project['status']) => {
    switch (status) {
      case "Completed":
        return "default"
      case "In Progress":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>{project.emoji}</span> {project.name}
            </CardTitle>
            <CardDescription>
              Due {new Date(project.dueDate).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge variant={getStatusVariant(project.status)}>
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm">
          <Grid className="h-4 w-4 text-muted-foreground" />
          <span>{project.tasks} tasks</span>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 px-6 py-3">
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-auto"
          onClick={() => onViewProject?.(project.id)}
        >
          View Project
        </Button>
      </CardFooter>
    </Card>
  )
}
