import { getDBConnection } from './db.js'

async function createTable() {
    const db = await getDBConnection()
    
    await db.exec(
        `
            ALTER TABLE posts
            ADD COLUMN updatedAt TEXT;
        `
    )
    await db.close()
    console.log('Table updated')
}

createTable()