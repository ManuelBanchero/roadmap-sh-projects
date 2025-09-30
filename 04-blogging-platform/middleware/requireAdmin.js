import { getDBConnection } from '../database/db.js'

export async function requireAdmin(req, res, next) {
    const userId = req.session.userId
    if(!userId) {
        console.log('Access hsa been blocked')
        return res.status(401).json({ error: 'Unauthorized' })
    }
    try {
        const db = await getDBConnection()
        const { role } = await db.get(`SELECT role FROM users WHERE id = ?`, [userId])
        if (role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Admin only.' })
        }
        next()
    } catch(error) {
        console.error('An error has ocurred trying to validate user, error: ', [])
        res.status(500).json({ error: 'Internal server error.' })
    }
}