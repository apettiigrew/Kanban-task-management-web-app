"use client"

import { ProjectCard } from "@/components/project-card"
import { Project } from "@/types/project"

interface ProjectsGridProps {
  projects: Project[]
  onViewProject?: (projectId: number) => void
  className?: string
}

export function ProjectsGrid({ 
  projects, 
  onViewProject, 
  className = "" 
}: ProjectsGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 w-full ${className}`}>
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project} 
          onViewProject={onViewProject}
        />
      ))}
    </div>
  )
}
