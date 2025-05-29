"use client"

import { useParams } from "next/navigation"
import { Board } from "@/components/board"
import { ErrorBoundary } from "@/components/error-boundary"

export default function BoardPage() {
  const params = useParams()
  const projectId = params.id

  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-4">
          <h2 className="text-xl font-medium mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">
            We encountered an error loading this board
          </p>
          <a href="/dashboard" className="underline">Return to dashboard</a>
        </div>
      </div>
    }>
      <Board boardId={projectId} />
    </ErrorBoundary>
  )
}
