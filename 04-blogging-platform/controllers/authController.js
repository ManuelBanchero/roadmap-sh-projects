import validator from 'validator'
import bcrypt from 'bcryptjs'
import { getDBConnection } from '../database/db.js'

export async function registerUser(req, res) {
    let { name, email, username, password } = req.body
    // verify all inputs 
    if (!name || !email || !username || !password)
        return res.status(400).json({ error: 'All fields are required.' })
    // trim inputs
    name = name.trim()
    email = email.trim()
    username = username.trim()
    // Regex on username
    const validUserRegex = /^[a-zA-Z0-9_-]{1,20}$/
    if(!validUserRegex.test(username))
        return res.status(400).json({ 
            error: 'Username Username must be 1–20 characters, using letters, numbers, _ or -.'
        })
    // validate email
    if(!validator.isEmail(email))
        return res.status(400).json({ error: 'Invalid email format.' })
    try {
        const db = await getDBConnection()
        // verify users does not already exists
        const userExists = await db.get(
            `SELECT * FROM users WHERE username = ? OR email = ?`,
            [username, email]
        )
        if(userExists)
            return res.status(400).json({ error: 'Email or username already exists.' })
        // hash password
        const hashed = await bcrypt.hash(password, 10)
        // create user
        const newUser = await db.run(
            `INSERT INTO users (name, email, username, password) VALUES (?, ?, ?, ?)`,
            [name, email, username, hashed]
        )
        // add userID to session 
        req.session.userId = newUser.lastID
        // response successfully to client
        res.status(201).json({ message: 'New user has registered.' })
    } catch(error) {
        console.error('An error has ocurred trying to register an user. Error: ', error)
        res.status(500).json({ error: 'Registration failed. Please try again.' })
    }
}

export async function loginUser(req, res) {
    let { username, password } = req.body
    // all fields required
    if(!username || !password)
        return res.status(400).json({ error: 'Al fields are required.' })
    // trim username
    username = username.trim()
    try {
        const db = await getDBConnection()
        // verify if user exists
        const user = await db.get(
            `SELECT * FROM users WHERE username = ?`,
            [username]
        )
        if(!user)
            return res.status(400).json({ error: 'Invalid credentials.' })
        // verify password
        const isVerify = await bcrypt.compare(password, user.password)
        if(!isVerify)
            return res.json({ error: 'Invalid credentials.' })
        // create session
        req.session.userId = user.id
        // response successfully
        res.json({ message: 'User logged in.' })
    } catch(error) {
        console.error('An error has ocurred trying to login. Error: ', error)
        res.status(500).json({ error: 'Login failed. Please try again.' })
    }
}

export function logoutUser(req, res) {
    req.session.destroy((error) => {
        if(error) {
            console.error('An error has ocurred trying to logout, Error:', error)
            return res.status(500).json({ error: 'Error loging out, try again.' })
        }
        res.json({ message: 'User logged out successfully.' })
    })
}