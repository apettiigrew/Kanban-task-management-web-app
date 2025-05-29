"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { UserProfileHeader } from "@/components/user-profile-header"
import { AddProjectButton } from "@/components/add-project-button"
import { ProjectSearch } from "@/components/project-search"
import { CollapsibleProjectsList } from "@/components/collapsible-projects-list"
import { SidebarHelpButton } from "@/components/sidebar-help-button"
import { Project } from "@/types/project"

interface DashboardSidebarProps {
  projects: Project[]
  searchQuery: string
  onSearchChange: (query: string) => void
  showAllProjects: boolean
  onToggleShowAll: () => void
  onAddProject?: () => void
  onHelp?: () => void
  username?: string
  avatarUrl?: string
  userInitials?: string
}

export function DashboardSidebar({
  projects,
  searchQuery,
  onSearchChange,
  showAllProjects,
  onToggleShowAll,
  onAddProject,
  onHelp,
  username,
  avatarUrl,
  userInitials
}: DashboardSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <UserProfileHeader 
          username={username}
          avatarUrl={avatarUrl}
          userInitials={userInitials}
        />
      </SidebarHeader>

      <SidebarContent>
        <AddProjectButton onClick={onAddProject} />
        
        <ProjectSearch 
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />

        <CollapsibleProjectsList
          projects={projects}
          showAllProjects={showAllProjects}
          onToggleShowAll={onToggleShowAll}
        />
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <SidebarHelpButton onClick={onHelp} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
