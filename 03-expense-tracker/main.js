#!/usr/bin/env node
import { Command } from 'commander'
import inquirer from 'inquirer'
import chalk from 'chalk'
import path from 'node:path'
import fs from 'node:fs/promises'

const __dirname = import.meta.dirname
const pathFile = path.join(__dirname, 'data.json')
const budgetFile = path.join(__dirname, 'budget.txt')
const categories = ['Home', 'College', 'Work', 'Family', 'Hangout', 'Learning', 'Workouts', 'Food']

const program = new Command()

function successLog(text) {
    console.log(chalk.green.bold(text))
}

function errorLog(text, error) {
    console.error(chalk.red.bold(text), error)
}

async function getData() {
    try {
        const data = await fs.readFile(pathFile)
        const jsonData = JSON.parse(data)
        return jsonData
    } catch(error) {
        errorLog(`Unexpected error has ocurred trying to get the data, Error: ${error}`)
    }
}

async function addExpense(description, amount, expensesData, category = null) {
    try {
        const lastExpense = expensesData.slice(-1)[0]
        const lastId = lastExpense?.id || 0
        const expenseId = lastId + 1
        const newExpense = {
            id: expenseId,
            description,
            amount,
            category,
            date: new Date().toISOString()
        }

        expensesData.push(newExpense)
        await fs.writeFile(pathFile, JSON.stringify(expensesData, null, 2), 'utf8')

        return newExpense
    } catch(error) {
        errorLog('Unexpected error has ocurred trying to write the file, Error: ', error)
    }
}

async function checkBudget(month) {
    const budget = Number(await fs.readFile(budgetFile, 'utf8'))
    if (!budget) return
    const expensesData = await getData()
    const monthSummary = expensesData
        .reduce((summary, expense) => {
            if (new Date(expense.date).getMonth() === month) { 
                return summary + Number(expense.amount)
            }
            return summary
        }, 0)

    if (monthSummary > budget) {
        console.log(chalk.yellow.bold(`\n🟡 You have exceeded your budget.\n- Budget: ${budget}\n- Expenses summary this month: ${monthSummary}`))
    }
}

program
    .name('expense-tracker')
    .description('A CLI expense tracker application')
    .version('1.0.0')

program
    .command('add')
    .description('Add an expense with a description and amount')
    .option('-c, --category', 'Specify an expense category')
    .action(async (option) => {
        try {
            const { description, amount } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'description',
                    message: 'Description: ',
                    validate: (input) => input.length >= 3 ? true : 'The descrition must be at least 3 characters long.'
                },
                {
                    type: 'input',
                    name: 'amount',
                    message: 'Amount:',
                    validate: (input) => Number(input) ? true : 'The amount must be a number.'
                }
            ])
            const expensesData = await getData()
            if (option.category) {
                const { category } = await inquirer.prompt([{
                    type: 'list',
                    name: 'category',
                    message: 'Select category:',
                    choices: categories
                }])
                const newExpense = await addExpense(description, amount, expensesData, category)
                successLog(`\n✅ Expense added successfully (ID: ${newExpense.id})`)
                checkBudget(new Date(newExpense.date).getMonth())
            } else {
                const newExpense = await addExpense(description, amount, expensesData)
                successLog(`\n✅ Expense added successfully (ID: ${newExpense.id})`)
                checkBudget(new Date(newExpense.date).getMonth())
            }

        } catch(error) {
            errorLog(`Unexpected error ocurred trying to add the expense, Error: ${error}`)
        }
    })

program
    .command('list')
    .description('List all your expenses')
    .option('-c, --category', 'List your expenses by category')
    .action(async (option) => {
        try {
            const expensesData = await getData()
            let filteredData = expensesData

            if (option.category) {
                const { category } = await inquirer.prompt([{
                    type: 'list',
                    name: 'category',
                    message: 'Select category:',
                    choices: categories
                }])
                filteredData = filteredData.filter(expense => 
                    expense.category === category
                )
            }

            console.table(filteredData, ['id', 'date', 'description', 'amount', 'category'])
        } catch(error) {
            errorLog('An unexpected error has ocurred trying to list your expenses, Error: ', error)
        }
    })

program
    .command('summary')
    .description('Get a summary of all expenses')
    .option('-m, --month', 'Specify the summary month')
    .option('-c, --category', 'Specify a category for your summary')
    .action(async (options) => {
        try {
            const expensesData = await getData()
            let filteredData = expensesData
            if (options.month) {
                const { month } = await inquirer.prompt([{
                    type: 'input',
                    name: 'month',
                    message: 'Month:',
                    validate: (input) => Number(input) > 0 && Number(input) <= 12 ? true : 'The month must be a number and a valid month.'
                }])

                filteredData = filteredData.filter(expense => new Date(expense.date).getMonth() + 1 === Number(month))
            } else if (options.category) {
                const { category } = await inquirer.prompt([{
                    type: 'list',
                    name: 'category',
                    message: 'Select category:',
                    choices: categories
                }])
                filteredData = filteredData.filter(expense => 
                    expense.category === category
                )
            }
            const summary = filteredData.reduce((acum, expense) => Number(expense.amount) + acum, 0)
            console.log(chalk.cyanBright.bold(`Total expenses: ${summary}`))
        } catch(error) {
            errorLog('An unexpected error has ocurred trying to summary your expenses, Error: ', error)
        }
    })

program
    .command('delete')
    .description('Delete an expense by id')
    .option('-a, --all', 'Delete all your expenses.')
    .action(async (option) => {
        try {
            if (option.all) {
                const { confirmation } = await inquirer.prompt([{
                    type: 'list',
                    name: 'confirmation',
                    message: 'Are you sure?',
                    choices: ['Yes', 'No']
                }])
                if (confirmation === 'No') return
                await fs.writeFile(pathFile, JSON.stringify([], null, 2), 'utf8')
                return successLog('✅ All expenses has been deleted successfully.')
            }
            const { id } = await inquirer.prompt([{
                type: 'input',
                name: 'id',
                message: 'Expense ID:',
                validate: ((input) => Number(input) ? true : 'The id must be a number.')
            }])
            const expensesData = await getData()
            const expenseIndex = expensesData.findIndex((expense) => expense.id == id)
            if (expenseIndex === -1) {
                throw Error(`The expense with ID ${id} does not exists, try again.`)
            }
            expensesData.splice(expenseIndex, 1)
            await fs.writeFile(pathFile, JSON.stringify(expensesData, null, 2), 'utf8')
            successLog('✅ Expense has been deleted successfully.')
        } catch(error) {
            errorLog('An unexpected error has ocurred trying to delete your expense, Error: ', error)
        }
    })

program
    .command('update')
    .description('Update an expense by id')
    .action(async () => {
        try {
            const expensesData = await getData()
            const { id, property, value } = await inquirer.prompt([{
                type: 'input',
                name: 'id',
                message: 'Expense ID:',
                validate: ((input) => Number(input) ? true : 'The id must be a number.')
            }, {
                type: 'list',
                name: 'property',
                message: 'Select property:',
                choices: ['description', 'amount']
            }, {
                type: 'input',
                name: 'value',
                message: 'Value:'
            }])
            const expenseIndex = expensesData.findIndex((expense) => expense.id == id)
            if (expenseIndex === -1) {
                throw Error(`The expense with ID ${id} does not exists, try again.`)
            } else if (typeof expensesData[expenseIndex][property] !== typeof value) {
                throw Error(`The value is not correct.`)
            }
            expensesData[expenseIndex][property] = value
            await fs.writeFile(pathFile, JSON.stringify(expensesData, null, 2), 'utf8')
            successLog('✅ Expense has been updated successfully.')
            checkBudget(new Date(expensesData[expenseIndex].date).getMonth())
        } catch(error) {
            errorLog('An unexpected error has ocurred trying to delete your expense, Error: ', error)
        }
    })

program
    .command('budget')
    .description('Set a budget for each month and get a warning when you exceed it.')
    .option('-d, --delete', 'Delete budget.')
    .action(async (option) => {
        try {

            if (option.delete) {
                await fs.writeFile(budgetFile, '')
                return successLog('✅ Budget has been deleted.')
            }

            const { budget } = await inquirer.prompt([{
                type: 'input',
                name: 'budget',
                message: 'Budget:∑',
                validate: (input => Number(input) > 0 ? true : 'Budget must be a number and greater than zero.')
            }])

            await fs.writeFile(budgetFile, budget.toString())
            successLog('✅ Budget has been added.')
        } catch(error) {
            errorLog('An unexpected error has ocurred trying to delete your expense, Error: ', error)
        }
    })

program.parse()