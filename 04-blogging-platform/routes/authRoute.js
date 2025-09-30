import { Router } from 'express'
import { registerUser, loginUser, logoutUser } from '../controllers/authController.js'

export const authRouter = Router()

authRouter.post('/register', registerUser)
authRouter.post('/login', loginUser)
authRouter.get('/logout', logoutUser)
