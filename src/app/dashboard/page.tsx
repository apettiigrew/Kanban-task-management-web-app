"use client"

import { useState } from "react"
import { Bell, ChevronDown, ChevronRight, Grid, Hash, Plus, Search, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"

// Dummy data for projects
const allProjects = [
  { id: 1, name: "Welcome", emoji: "👋", tasks: 11, status: "In Progress", dueDate: "2025-06-15" },
  { id: 2, name: "Try Boards", emoji: "🔍", tasks: 3, status: "Not Started", dueDate: "2025-06-20" },
  { id: 3, name: "Project One", emoji: "🚀", tasks: 8, status: "In Progress", dueDate: "2025-06-10" },
  { id: 4, name: "Website Redesign", emoji: "💻", tasks: 15, status: "In Progress", dueDate: "2025-07-01" },
  { id: 5, name: "Marketing Campaign", emoji: "📣", tasks: 7, status: "Not Started", dueDate: "2025-07-15" },
  { id: 6, name: "Product Launch", emoji: "🎯", tasks: 22, status: "Planning", dueDate: "2025-08-01" },
  { id: 7, name: "Research", emoji: "🔬", tasks: 5, status: "Completed", dueDate: "2025-05-30" },
  { id: 8, name: "Client Onboarding", emoji: "🤝", tasks: 9, status: "In Progress", dueDate: "2025-06-25" },
  { id: 9, name: "Team Retreat", emoji: "🏝️", tasks: 6, status: "Planning", dueDate: "2025-09-10" },
  { id: 10, name: "Budget Review", emoji: "💰", tasks: 4, status: "Not Started", dueDate: "2025-06-30" },
  { id: 11, name: "App Development", emoji: "📱", tasks: 18, status: "In Progress", dueDate: "2025-08-15" },
  { id: 12, name: "Content Strategy", emoji: "📝", tasks: 12, status: "Planning", dueDate: "2025-07-05" },
  { id: 13, name: "User Testing", emoji: "🧪", tasks: 8, status: "Not Started", dueDate: "2025-07-20" },
  { id: 14, name: "Analytics Review", emoji: "📊", tasks: 5, status: "Completed", dueDate: "2025-06-05" },
  { id: 15, name: "Infrastructure Update", emoji: "🏗️", tasks: 14, status: "Planning", dueDate: "2025-08-10" },
]

export default function Dashboard() {
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter projects based on search query
  const filteredProjects = allProjects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Limit displayed projects in sidebar
  const displayedSidebarProjects = showAllProjects ? filteredProjects : filteredProjects.slice(0, 10)

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center justify-between w-full px-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">johndoe</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarHeader>

          <SidebarContent>
            <div className="p-4">
              <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-2" size="sm">
                <Plus className="h-4 w-4" />
                Add project
              </Button>
            </div>

            <div className="px-4 pb-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search projects..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-2">
              <div className="px-4 py-2 text-sm font-medium bg-muted/50">My Projects</div>

              <SidebarMenu>
                {displayedSidebarProjects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton className="justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span>{project.name}</span>
                      </div>
                      <span className="text-muted-foreground">{project.tasks}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                {filteredProjects.length > 10 && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setShowAllProjects(!showAllProjects)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <div className="flex items-center gap-2">
                        {showAllProjects ? (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            <span>Show less</span>
                          </>
                        ) : (
                          <>
                            <ChevronRight className="h-4 w-4" />
                            <span>Show {filteredProjects.length - 10} more</span>
                          </>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </div>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <User className="h-4 w-4" />
              <span>Help</span>
            </Button>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <SidebarInset className="flex-1 w-full">
          <div className="flex flex-col h-full w-full">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6 w-full">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">Projects Dashboard</h1>
              <div className="ml-auto flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500"></span>
                </Button>
              </div>
            </header>

            <main className="flex-1 overflow-auto p-6 w-full">
              <div className="flex items-center justify-between mb-6 w-full">
                <div>
                  <h2 className="text-2xl font-bold">All Projects</h2>
                  <p className="text-muted-foreground">Manage and track your projects</p>
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 w-full">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <span>{project.emoji}</span> {project.name}
                          </CardTitle>
                          <CardDescription>Due {new Date(project.dueDate).toLocaleDateString()}</CardDescription>
                        </div>
                        <Badge
                          variant={
                            project.status === "Completed"
                              ? "default"
                              : project.status === "In Progress"
                                ? "secondary"
                                : "outline"
                          }
                        >
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
                      <Button variant="ghost" size="sm" className="ml-auto">
                        View Project
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
