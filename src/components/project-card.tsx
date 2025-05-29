"use client"

import Link from "next/link"
import { Project } from "@/types/project"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link 
      href={`/board/${project.id}`} 
      className="flex items-center py-4 px-2 hover:bg-muted/50 rounded-md transition-colors"
    >
      <div className="flex items-center w-full">
        <span className="text-muted-foreground text-xl mr-4">#</span>
        <span className="text-lg font-medium">
          {project.name} {project.emoji && <span>{project.emoji}</span>}
        </span>
      </div>
    </Link>
  )
}
