import { getDBConnection } from './db.js'

(async () => {
    try {
        const db = await getDBConnection()
        await db.run(
            `DELETE FROM posts WHERE id = ?`,
            [1]
        )
        console.log('Post deleted successfully.')
    } catch(error) {
        console.error('An error has ocurred trying to delete a post, error: ', error)
    }
})()