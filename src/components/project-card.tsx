"use client"

import Link from "next/link"
import { useState } from "react"
import { MoreHorizontal, Edit, ExternalLink } from "lucide-react"
import { Project } from "@/types/project"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditProjectModal } from "@/components/edit-project-modal"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsEditModalOpen(true)
  }

  return (
    <>
      <div className="flex items-center py-4 px-2 hover:bg-muted/50 rounded-md transition-colors group">
        <Link 
          href={`/board/${project.id}`} 
          className="flex items-center w-full"
        >
          <span className="text-muted-foreground text-xl mr-4">#</span>
          <span className="text-lg font-medium">
            {project.title} {project.emoji && <span>{project.emoji}</span>}
          </span>
        </Link>
        
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={handleDropdownClick}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Project options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditClick}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/board/${project.id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Board
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <EditProjectModal
        project={project}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </>
  )
}
