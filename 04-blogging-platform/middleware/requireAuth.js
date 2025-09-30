export function requireAuth(req, res, next) {
    const userId = req.session.userId
    if(!userId) {
        console.log('Access hsa been blocked')
        return res.status(401).json({ error: 'Unauthorized' })
    }
    next()
}