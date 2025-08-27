import readline from 'readline-sync'
import { addTask,
    updateTask,
    deleteTask,
    markInProgress,
    markDone,
    markTodo,
    getTaskDone,
    getTaskInProgress,
    getTodoTasks,
    getTasks
} from './utils.js'

const options = ['add', 'update', 'delete', 'mark-in-progress', 'mark-done', 'mark-todo', 'list', 'exit']
const taskStatus = ['done', 'todo', 'in-progress']

function getDescription(input) {
    const startDescription = input.indexOf('"') + 1
    const endDescription = input.lastIndexOf('"')
    const description = input.slice(startDescription, endDescription)

    return description
}

async function executeCommand(input, inputValues, command) {
    switch(command) {
        case 'add': {
            await addTask(getDescription(input))
            break
        }
        case 'update': {
            const id = Number(inputValues[1])
            await updateTask(id, getDescription(input))
            break
        }
        case 'delete': {
            const id = Number(inputValues[1])
            await deleteTask(id)
            break
        }
        case 'mark-in-progress': {
            const id = Number(inputValues[1])
            await markInProgress(id)
            break
        }
        case 'mark-done': {
            const id = Number(inputValues[1])
            await markDone(id)
            break
        }
        case 'mark-todo': {
            const id = Number(inputValues[1])
            await markTodo(id)
            break
        }
        case 'list': {
            const status = inputValues[1] || null
            if (!status) {
                console.log(await getTasks())
                break
            }
            if(!taskStatus.includes(status)) {
                console.log(`The status ${status} does not exists. Try again.\nHere is the list of the status that you can use: `)
                taskStatus.forEach((option, i) => console.log(`${i + 1}- ${option}`))
            }
            switch(status) {
                case 'done':
                    console.log(await getTaskDone())
                    break
                case 'todo': 
                    console.log(await getTodoTasks())
                    break
                case 'in-progress':
                    console.log(await getTaskInProgress())
                    break
                default:
                    break
            }
            break
        }
        default: 
            break
    }
}

async function main() {
    let input = ''
    while (true) {
        input = readline.question('- ')
        const inputValues = input.split(' ')
        const command = inputValues[0]
        
        if (!options.includes(command)) {
            console.log(`The command ${command} does not exists. Try again.\nHere is the list of the command that you can use: `)
            options.forEach((option, i) => console.log(`${i + 1}- ${option}`))
            continue
        }

        if (command === 'exit') return
        
        await executeCommand(input, inputValues, command)
        console.log('\n')
    }
    
}

main()