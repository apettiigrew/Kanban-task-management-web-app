# Task List: Task Management App Implementation

**Based on:** `prd-task-management.md`  
**Created:** May 30, 2025  
**Target:** Junior Developer Implementation Guide

## Overview

This task list implements a multi-project Kanban task management system with drag-and-drop functionality, built on Next.js with local storage persistence.

## Relevant Files

- `prisma/schema.prisma` - Prisma database schema for Project, Task, and Column models
- `src/types/project.ts` - TypeScript interfaces for Project, Task, and Column data models
- `src/types/task.ts` - Enhanced task type definitions with multi-project support
- `src/lib/prisma.ts` - Prisma client configuration and connection
- `src/lib/validations/project.ts` - Zod validation schemas for project operations
- `src/lib/validations/task.ts` - Zod validation schemas for task operations
- `src/lib/validations/column.ts` - Zod validation schemas for column operations
- `src/hooks/queries/use-projects.ts` - TanStack Query hooks for project operations
- `src/hooks/queries/use-tasks.ts` - TanStack Query hooks for task operations
- `src/hooks/queries/use-columns.ts` - TanStack Query hooks for column operations
- `src/hooks/mutations/use-project-mutations.ts` - TanStack Query mutations for projects
- `src/hooks/mutations/use-task-mutations.ts` - TanStack Query mutations for tasks
- `src/hooks/mutations/use-column-mutations.ts` - TanStack Query mutations for columns
- `src/app/api/projects/route.ts` - API route for project CRUD operations
- `src/app/api/projects/[id]/route.ts` - API route for individual project operations
- `src/app/api/tasks/route.ts` - API route for task CRUD operations
- `src/app/api/tasks/[id]/route.ts` - API route for individual task operations
- `src/app/api/columns/route.ts` - API route for column CRUD operations
- `src/app/api/columns/[id]/route.ts` - API route for individual column operations
- `src/components/project-dashboard.tsx` - Main dashboard component with TanStack Query
- `src/components/project-dashboard.test.tsx` - Unit tests for project dashboard
- `src/components/project-card.tsx` - Individual project card using Shadcn components
- `src/components/project-form.tsx` - Form component using React Hook Form and Zod
- `src/components/project-form.test.tsx` - Unit tests for project form
- `src/components/enhanced-task-card.tsx` - Enhanced task card with Shadcn UI components
- `src/components/enhanced-task-card.test.tsx` - Unit tests for enhanced task card
- `src/components/task-form-modal.tsx` - Modal using Shadcn Dialog and React Hook Form
- `src/components/column-manager.tsx` - Column management with drag-and-drop and forms
- `src/app/dashboard/page.tsx` - Dashboard page component with TanStack Query
- `src/app/project/[id]/page.tsx` - Individual project board page with real-time data
- `src/app/project/[id]/layout.tsx` - Layout for project pages

### Notes

- Unit tests should be placed alongside the code files they are testing
- Use `npm test` to run Jest tests for the project
- Use Shadcn UI components and Tailwind CSS for all UI elements
- Use Lucide React icons for all icon requirements
- Leverage existing drag-and-drop implementation from @atlaskit/pragmatic-drag-and-drop
- All data persistence handled through PostgreSQL with Prisma ORM
- Use TanStack Query for all data fetching and mutations
- Form validation with React Hook Form and Zod schemas
- Server-side validation with Zod in API routes

## Tasks

- [ ] 1.0 Set up database schema and data persistence infrastructure
  - [x] 1.1 Create Prisma schema in `prisma/schema.prisma` for Project, Task, and Column models
  - [ ] 1.2 Set up Prisma client configuration in `src/lib/prisma.ts`
  - [ ] 1.3 Create Zod validation schemas for all data models in `src/lib/validations/`
  - [ ] 1.4 Update TypeScript interfaces in `src/types/` to match Prisma models
  - [ ] 1.5 Run initial database migration and seed data
  - [ ] 1.6 Create API routes for CRUD operations on all models
  - [ ] 1.7 Implement error handling and data validation in API routes using Zod

- [ ] 2.0 Implement TanStack Query hooks and multi-project dashboard
  - [ ] 2.1 Create TanStack Query hooks in `src/hooks/queries/use-projects.ts` for fetching projects
  - [ ] 2.2 Create TanStack Query mutation hooks in `src/hooks/mutations/use-project-mutations.ts`
  - [ ] 2.3 Build project dashboard component using TanStack Query and Shadcn UI components
  - [ ] 2.4 Design project card component using Shadcn Card and Lucide icons
  - [ ] 2.5 Implement project navigation and routing structure with loading states
  - [ ] 2.6 Add responsive design using Tailwind CSS for tablet and desktop viewports
  - [ ] 2.7 Write unit tests for dashboard components and TanStack Query hooks

- [ ] 3.0 Create project CRUD operations with forms and validation
  - [ ] 3.1 Build project creation form using React Hook Form and Zod validation
  - [ ] 3.2 Create project editing modal using Shadcn Dialog and form components
  - [ ] 3.3 Implement project deletion with Shadcn AlertDialog confirmation
  - [ ] 3.4 Add optimistic updates using TanStack Query mutations
  - [ ] 3.5 Create project details view with inline editing capabilities
  - [ ] 3.6 Implement form error handling and server-side validation feedback
  - [ ] 3.7 Write unit tests for project CRUD operations and form validation

- [ ] 4.0 Build enhanced task management with database integration
  - [ ] 4.1 Create TanStack Query hooks for task operations in `src/hooks/queries/use-tasks.ts`
  - [ ] 4.2 Build task mutation hooks in `src/hooks/mutations/use-task-mutations.ts`
  - [ ] 4.3 Create enhanced task card component using Shadcn Card and Badge components
  - [ ] 4.4 Build task creation/editing modal using React Hook Form and Shadcn Dialog
  - [ ] 4.5 Implement task deletion with confirmation using Shadcn AlertDialog
  - [ ] 4.6 Add task search and filtering with Shadcn Input and Select components
  - [ ] 4.7 Implement real-time task updates using TanStack Query invalidation
  - [ ] 4.8 Write unit tests for enhanced task management components

- [ ] 5.0 Implement drag-and-drop functionality with database persistence
  - [ ] 5.1 Create TanStack Query hooks for column operations in `src/hooks/queries/use-columns.ts`
  - [ ] 5.2 Build column mutation hooks in `src/hooks/mutations/use-column-mutations.ts`
  - [ ] 5.3 Extend existing drag-and-drop to work with database-backed data
  - [ ] 5.4 Implement task reordering within columns with optimistic updates
  - [ ] 5.5 Add drag-and-drop for moving tasks between columns with API calls
  - [ ] 5.6 Create column management with React Hook Form and Shadcn components
  - [ ] 5.7 Implement visual feedback using Tailwind CSS animations during drag operations
  - [ ] 5.8 Add column creation, editing, and deletion with database persistence
  - [ ] 5.9 Ensure all drag operations persist immediately to database via TanStack Query
  - [ ] 5.10 Write integration tests for drag-and-drop functionality with API mocking
