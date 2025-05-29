"use client"

import { ProjectCard } from "@/components/project-card"
import { Project } from "@/types/project"

interface ProjectsGridProps {
  projects: Project[]
  className?: string
}

export function ProjectsGrid({ 
  projects, 
  className = "" 
}: ProjectsGridProps) {
  return (
    <div className={`flex flex-col gap-4 w-full ${className}`}>
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project} 
        />
      ))}
    </div>
  )
}
