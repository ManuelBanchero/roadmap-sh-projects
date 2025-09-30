import { getDBConnection } from './db.js'

(async () => {
    try {
        const db = await getDBConnection()
        
        await db.run(`UPDATE users SET role = 'admin' WHERE id = 1`)

        console.log('Successfully.')
    } catch(error) {
        console.error('An error has ocurred, error: ', error)
    }
})()