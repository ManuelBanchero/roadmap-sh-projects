import express from 'express'
import session from 'express-session'
import dotenv from 'dotenv'
import { authRouter } from './routes/authRoute.js'
import { postRouter } from './routes/postRoute.js'

dotenv.config()
const PORT = 8000
const secret = process.env.SPIRAL_SESSION_SECRET
const app = express()

app.use(express.json())
app.use(session({
	secret,
	resave: false,
	saveUninitialized: false,
	cookie: {
		httpOnly: true,
		secure: false,
		sameSite: 'lax'
	}
}))

app.use('/api/auth', authRouter)
app.use('/api/posts', postRouter)

app.listen(PORT, () => console.log(`🚀 App listening on port ${PORT}`))