import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample projects
  const project1 = await prisma.project.create({
    data: {
      title: 'Welcome Project',
      description: 'Getting started with your Kanban board',
      emoji: '👋',
    },
  })

  const project2 = await prisma.project.create({
    data: {
      title: 'Website Redesign',
      description: 'Complete redesign of the company website',
      emoji: '💻',
    },
  })

  console.log('✅ Created projects:', { project1: project1.title, project2: project2.title })

  // Create columns for project1
  const todoColumn1 = await prisma.column.create({
    data: {
      title: 'To Do',
      order: 0,
      projectId: project1.id,
    },
  })

  const inProgressColumn1 = await prisma.column.create({
    data: {
      title: 'In Progress',
      order: 1,
      projectId: project1.id,
    },
  })

  const doneColumn1 = await prisma.column.create({
    data: {
      title: 'Done',
      order: 2,
      projectId: project1.id,
    },
  })

  // Create columns for project2
  const todoColumn2 = await prisma.column.create({
    data: {
      title: 'Backlog',
      order: 0,
      projectId: project2.id,
    },
  })

  const designColumn2 = await prisma.column.create({
    data: {
      title: 'Design',
      order: 1,
      projectId: project2.id,
    },
  })

  const devColumn2 = await prisma.column.create({
    data: {
      title: 'Development',
      order: 2,
      projectId: project2.id,
    },
  })

  const reviewColumn2 = await prisma.column.create({
    data: {
      title: 'Review',
      order: 3,
      projectId: project2.id,
    },
  })

  console.log('✅ Created columns for both projects')

  // Create sample tasks for project1
  await prisma.task.create({
    data: {
      title: 'Welcome to your Kanban board!',
      description: 'This is your first task. Try dragging it between columns.',
      order: 0,
      labels: ['welcome', 'tutorial'],
      projectId: project1.id,
      columnId: todoColumn1.id,
    },
  })

  await prisma.task.create({
    data: {
      title: 'Create your first real task',
      description: 'Click the + button to add your own tasks',
      order: 1,
      labels: ['tutorial'],
      projectId: project1.id,
      columnId: todoColumn1.id,
    },
  })

  await prisma.task.create({
    data: {
      title: 'Explore the features',
      description: 'Try editing tasks, adding labels, and setting due dates',
      order: 0,
      labels: ['tutorial', 'exploration'],
      projectId: project1.id,
      columnId: inProgressColumn1.id,
    },
  })

  await prisma.task.create({
    data: {
      title: 'Read the documentation',
      description: 'Learn about all the features available',
      order: 0,
      labels: ['completed'],
      projectId: project1.id,
      columnId: doneColumn1.id,
    },
  })

  // Create sample tasks for project2
  await prisma.task.create({
    data: {
      title: 'User research and requirements gathering',
      description: 'Conduct user interviews and gather requirements for the new website',
      order: 0,
      labels: ['research', 'ux'],
      dueDate: new Date('2025-07-15'),
      projectId: project2.id,
      columnId: todoColumn2.id,
    },
  })

  await prisma.task.create({
    data: {
      title: 'Create wireframes',
      description: 'Design wireframes for all main pages',
      order: 1,
      labels: ['design', 'wireframes'],
      dueDate: new Date('2025-07-20'),
      projectId: project2.id,
      columnId: todoColumn2.id,
    },
  })

  await prisma.task.create({
    data: {
      title: 'Design system setup',
      description: 'Create design tokens, components, and style guide',
      order: 0,
      labels: ['design', 'system'],
      projectId: project2.id,
      columnId: designColumn2.id,
    },
  })

  await prisma.task.create({
    data: {
      title: 'Homepage design',
      description: 'Create high-fidelity designs for the homepage',
      order: 1,
      labels: ['design', 'homepage'],
      dueDate: new Date('2025-08-01'),
      projectId: project2.id,
      columnId: designColumn2.id,
    },
  })

  await prisma.task.create({
    data: {
      title: 'Set up development environment',
      description: 'Configure Next.js project with all necessary dependencies',
      order: 0,
      labels: ['development', 'setup'],
      projectId: project2.id,
      columnId: devColumn2.id,
    },
  })

  console.log('✅ Created sample tasks for both projects')

  console.log('🎉 Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
