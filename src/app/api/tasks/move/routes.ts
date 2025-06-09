import {
    createSuccessResponse,
    handleAPIError,
    NotFoundError,
    validateRequestBody
} from '@/lib/api-error-handler'
import { prisma } from '@/lib/prisma'
import { moveTaskSchema } from '@/lib/validations/task'
import { NextRequest } from 'next/server'

// PUT /api/tasks/move - Move a task between columns
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        
        // Validate the request body using centralized validation
        const validatedData = validateRequestBody(moveTaskSchema, body)

        // Check if task exists
        const existingTask = await prisma.card.findUnique({
            where: { id: validatedData.taskId },
        })

        if (!existingTask) {
            throw new NotFoundError('Task')
        }

        // Update all the tasks that need to have their order updated
        const updatePromises = []

        // Update the moved task's column and order
        updatePromises.push(
            prisma.card.update({
                where: { id: validatedData.taskId },
                data: {
                    columnId: validatedData.destinationColumnId,
                    order: validatedData.destinationOrder
                },
            })
        )

        // Update other tasks' orders if needed
        // For tasks in the destination column that need to shift down
        if (validatedData.sourceColumnId !== validatedData.destinationColumnId) {
            // If moving between different columns, increment order for tasks >= destinationOrder in destination column
            updatePromises.push(
                prisma.card.updateMany({
                    where: {
                        columnId: validatedData.destinationColumnId,
                        id: { not: validatedData.taskId },
                        order: { gte: validatedData.destinationOrder }
                    },
                    data: {
                        order: { increment: 1 }
                    }
                })
            )

            // Decrement order for tasks > original order in source column
            updatePromises.push(
                prisma.card.updateMany({
                    where: {
                        columnId: validatedData.sourceColumnId,
                        order: { gt: existingTask.order }
                    },
                    data: {
                        order: { decrement: 1 }
                    }
                })
            )
        } else {
            // Moving within the same column
            if (validatedData.destinationOrder > existingTask.order) {
                // Moving down: decrement order for tasks between old and new position
                updatePromises.push(
                    prisma.card.updateMany({
                        where: {
                            columnId: validatedData.destinationColumnId,
                            id: { not: validatedData.taskId },
                            order: {
                                gt: existingTask.order,
                                lte: validatedData.destinationOrder
                            }
                        },
                        data: {
                            order: { decrement: 1 }
                        }
                    })
                )
            } else if (validatedData.destinationOrder < existingTask.order) {
                // Moving up: increment order for tasks between new and old position
                updatePromises.push(
                    prisma.card.updateMany({
                        where: {
                            columnId: validatedData.destinationColumnId,
                            id: { not: validatedData.taskId },
                            order: {
                                gte: validatedData.destinationOrder,
                                lt: existingTask.order
                            }
                        },
                        data: {
                            order: { increment: 1 }
                        }
                    })
                )
            }
        }

        // Execute all updates in a transaction
        await prisma.$transaction(updatePromises)

        // Fetch the updated task with relations
        const updatedTask = await prisma.card.findUnique({
            where: { id: validatedData.taskId },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true,
                    }
                },
                column: {
                    select: {
                        id: true,
                        title: true,
                    }
                }
            }
        })

        return createSuccessResponse(updatedTask, 'Task moved successfully')
    } catch (error) {
        console.log('error', error)
        return handleAPIError(error, `/api/tasks/move`)
    }
} 