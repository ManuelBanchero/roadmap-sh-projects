import { getDBConnection } from './db.js'

(async () => {
    try {
        const db = await getDBConnection()
        await db.run(
            `INSERT INTO categories (name) VALUES (?), (?), (?)`,
            ['Programación', 'Tecnología', 'IA']
        )
        console.log('Categorias creadas con éxito.')
    } catch(error) {
        console.error('An error has ocurred trying to create a category, error: ', error)
    }
})()