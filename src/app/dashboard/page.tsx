"use client"

import { useState, useMemo } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ProjectsGrid } from "@/components/projects-grid"
import { AddProjectModal } from "@/components/add-project-modal"
import { LoadingState } from "@/components/loading-spinner"
import { useProjects, useCreateProject } from "@/hooks/queries/use-projects"

function DashboardContent() {
  const { 
    data: projects = [], 
    isLoading: loading, 
    error
  } = useProjects({
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  })

  const createProjectMutation = useCreateProject()
  
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter projects based on search query with memoization for performance
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects
    
    return projects.filter((project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [projects, searchQuery])

  // Event handlers
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleToggleShowAll = () => {
    setShowAllProjects(!showAllProjects)
  }

  const handleHelp = () => {
    // TODO: Implement help functionality
    console.log("Help clicked")
  }

  // Handle project creation with TanStack Query mutation
  const handleCreateProject = async (projectData: { title: string; description?: string | null; emoji?: string | null }) => {
    try {
      await createProjectMutation.mutateAsync(projectData)
    } catch (error) {
      console.error('Failed to create project:', error)
      // Error is handled by the mutation's onError callback
    }
  }

  // Format error message for display
  const errorMessage = error instanceof Error ? error.message : error ? String(error) : null

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar
          projects={filteredProjects}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          showAllProjects={showAllProjects}
          onToggleShowAll={handleToggleShowAll}
          onHelp={handleHelp}
        />

        <SidebarInset className="flex-1 w-full">
          <div className="flex flex-col h-full w-full">
            <DashboardHeader />

            <main className="flex-1 overflow-auto p-6 w-full">
              <div className="flex items-center justify-between mb-6 w-full">
                <div>
                  <h2 className="text-2xl font-bold">All Projects</h2>
                  <p className="text-muted-foreground">Manage and track your projects</p>
                </div>
                <AddProjectModal
                  onCreateProject={handleCreateProject}
                  loading={createProjectMutation.isPending}
                />
              </div>
              
              {errorMessage && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{errorMessage}</p>
                </div>
              )}
              
              {loading ? (
                <LoadingState message="Loading projects..." />
              ) : (
                <ProjectsGrid 
                  projects={filteredProjects}
                />
              )}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default function Dashboard() {
  return <DashboardContent />
}
