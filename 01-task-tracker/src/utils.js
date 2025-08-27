import fs from 'node:fs/promises'
import path from 'node:path'

const __dirname = import.meta.dirname
const tasksPath = path.join(__dirname, 'tasks.json')

async function getTasks() {
    try {
        const tasks = JSON.parse(await fs.readFile(tasksPath, 'utf-8'))
        return tasks
    } catch(err) {
        if (err.code === 'ENOENT' || err instanceof SyntaxError)
            return []
    }
}

function findTaskIndex(tasksData, id) {
    const taskIndex = tasksData.findIndex(task => task.id === id)
    if(taskIndex === -1)
        throw new Error(`Could not find any task with id: ${id}`)
    return taskIndex
}

async function addTask(description) {
    try {
        if (!description)
            throw new Error('Description can not be undefined.')
        if (typeof description !== 'string') 
            throw new Error('Description must be a string.')

        const tasksData = await getTasks()

        const id = (tasksData[tasksData.length - 1]?.id + 1) || 1 // Auto incresed ID
        const task = {
            id,
            description,
            status: 'todo',
            createdAt: (new Date()).toString(),
            updatedAt: null
        }
        tasksData.push(task)

        await fs.writeFile(tasksPath, JSON.stringify(tasksData, null, 2), 'utf-8')
        console.log('Task has been added successfully.')

    } catch(error) {
        console.error('An unexpected error ocurred trying to ADD a task to the JSON file: ', error)
    }
}

async function updateTask(id, description) {
    try {
        if (!description)
            throw new Error('Description can not be undefined.')
        if (!id) 
            throw new Error('Id can not be undefined.')
        if (typeof description !== 'string') 
            throw new Error('Description must be a string.')
        if (typeof id !== 'number')
            throw new Error('Id must be a number.')

        const tasksData = await getTasks()
        if (tasksData.length === 0)
            throw new Error('Empty file.')

        const taskIndex = findTaskIndex(tasksData, id)
        const task = tasksData[taskIndex]
        
        task.description = description
        task.updatedAt = (new Date()).toString()
        await fs.writeFile(tasksPath, JSON.stringify(tasksData, null, 2), 'utf-8')
        console.log('Task has been updated successfully.')

    } catch(error) {
        console.error('An unexpected error ocurred trying to UPDATE a task to the JSON file: ', error)
    }
}

async function deleteTask(id) {
    try {
        if (!id) 
            throw new Error('Id can not be undefined.')
        if (typeof id !== 'number')
            throw new Error('Id must be a number.')

        const tasksData = await getTasks()
        if (tasksData.length === 0)
            throw new Error('Empty file.')

        const taskIndex = findTaskIndex(tasksData, id)
        tasksData.splice(taskIndex, 1) // task deleted
        await fs.writeFile(tasksPath, JSON.stringify(tasksData, null, 2), 'utf-8')
        console.log('Task has been deleted successfully.')

    } catch(error) {
        console.error('An unexpected error ocurred trying to DELETE a task to the JSON file: ', error)
    }
}

async function markInProgress(id) {
    try {
        if (!id) 
            throw new Error('Id can not be undefined.')
        if (typeof id !== 'number')
            throw new Error('Id must be a number.')

        const tasksData = await getTasks()
        if (tasksData.length === 0)
            throw new Error('Empty file.')

        const taskIndex = findTaskIndex(tasksData, id)
        const task = tasksData[taskIndex]
        task.status = 'in-progress'
        await fs.writeFile(tasksPath, JSON.stringify(tasksData, null, 2), 'utf-8')
        console.log('Task has been updated his status to "in-progress" successfully.')

    } catch(error) {
        console.error('An unexpected error ocurred trying to MARK IN PROGRESS a task to the JSON file: ', error)
    }
}

async function markDone(id) {
    try {
        if (!id) 
            throw new Error('Id can not be undefined.')
        if (typeof id !== 'number')
            throw new Error('Id must be a number.')

        const tasksData = await getTasks()
        if (tasksData.length === 0)
            throw new Error('Empty file.')

        const taskIndex = findTaskIndex(tasksData, id)
        const task = tasksData[taskIndex]
        task.status = 'done'
        await fs.writeFile(tasksPath, JSON.stringify(tasksData, null, 2), 'utf-8')
        console.log('Task has been updated his status to "done" successfully.')

    } catch(error) {
        console.error('An unexpected error ocurred trying to MARK IN PROGRESS a task to the JSON file: ', error)
    }
}

async function markTodo(id) {
    try {
        if (!id) 
            throw new Error('Id can not be undefined.')
        if (typeof id !== 'number')
            throw new Error('Id must be a number.')

        const tasksData = await getTasks()
        if (tasksData.length === 0)
            throw new Error('Empty file.')

        const taskIndex = findTaskIndex(tasksData, id)
        const task = tasksData[taskIndex]
        task.status = 'todo'
        await fs.writeFile(tasksPath, JSON.stringify(tasksData, null, 2), 'utf-8')
        console.log('Task has been updated his status to "todo" successfully.')

    } catch(error) {
        console.error('An unexpected error ocurred trying to MARK IN PROGRESS a task to the JSON file: ', error)
    }
}

async function getTaskDone() {
    const tasksData = await getTasks()
    if (tasksData.length === 0)
        throw new Error('Empty file.')

    return tasksData.filter(task => task.status === 'done')
}

async function getTaskInProgress() {
    const tasksData = await getTasks()
    if (tasksData.length === 0)
        throw new Error('Empty file.')

    return tasksData.filter(task => task.status === 'in-progress')
}

async function getTodoTasks() {
    const tasksData = await getTasks()
    if (tasksData.length === 0)
        throw new Error('Empty file.')

    return tasksData.filter(task => task.status === 'todo')
}

export { addTask,
    updateTask,
    deleteTask,
    markInProgress,
    markDone,
    markTodo,
    getTaskDone,
    getTaskInProgress,
    getTodoTasks,
    getTasks
}