import { Router } from 'express'
import { createPost, updatePost, deletePost, getPost, getAllPosts } from '../controllers/postController.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

export const postRouter = Router()

postRouter.post('/', requireAdmin, createPost)
postRouter.put('/:id', requireAdmin, updatePost)
postRouter.delete('/:id', requireAdmin, deletePost)
postRouter.get('/:id', getPost)
postRouter.get('/', getAllPosts)