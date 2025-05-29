"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { MainContentHeader } from "@/components/main-content-header"
import { ProjectsGrid } from "@/components/projects-grid"
import { AddProjectModal } from "@/components/add-project-modal"
import { ProjectDetailsModal } from "@/components/project-details-modal"
import { LoadingState } from "@/components/loading-spinner"
import { ProjectProvider, useProjects } from "@/contexts/project-context"
import { Project } from "@/types/project"

function DashboardContent() {
  const { projects, addProject, deleteProject, getProject, loading, error } = useProjects()
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Event handlers
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleToggleShowAll = () => {
    setShowAllProjects(!showAllProjects)
  }

  const handleAddProject = () => {
    setShowAddModal(true)
  }

  const handleNewProject = () => {
    setShowAddModal(true)
  }

  const handleViewProject = (projectId: number) => {
    const project = getProject(projectId)
    if (project) {
      setSelectedProject(project)
      setShowDetailsModal(true)
    }
  }

  const handleHelp = () => {
    // TODO: Implement help functionality
    console.log("Help clicked")
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar
          projects={filteredProjects}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          showAllProjects={showAllProjects}
          onToggleShowAll={handleToggleShowAll}
          onAddProject={handleAddProject}
          onHelp={handleHelp}
        />

        <SidebarInset className="flex-1 w-full">
          <div className="flex flex-col h-full w-full">
            <DashboardHeader />

            <main className="flex-1 overflow-auto p-6 w-full">
              <MainContentHeader onNewProject={handleNewProject} />
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              {loading ? (
                <LoadingState message="Loading projects..." />
              ) : (
                <ProjectsGrid 
                  projects={filteredProjects}
                  onViewProject={handleViewProject}
                />
              )}
            </main>
          </div>
        </SidebarInset>
      </div>

      <AddProjectModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAddProject={addProject}
        loading={loading}
      />

      <ProjectDetailsModal
        project={selectedProject}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        onDeleteProject={deleteProject}
      />
    </SidebarProvider>
  )
}

export default function Dashboard() {
  return (
    <ProjectProvider>
      <DashboardContent />
    </ProjectProvider>
  )
}
