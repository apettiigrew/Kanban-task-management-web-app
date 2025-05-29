"use client"

import { useParams } from "next/navigation"

export default function BoardPage() {
  const params = useParams()
  const projectId = params.id

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Project Board</h1>
            <p className="text-muted-foreground">
              Project ID: {projectId}
            </p>
            <p className="text-sm text-muted-foreground">
              Board view implementation coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
