import sanitizeHtml from 'sanitize-html'
import { getDBConnection } from '../database/db.js'

function sanitizeField(field) {
    const sanitizeSettings = {
	    allowedTags: [], 
	    allowedAttributes: {} 
    }

    return sanitizeHtml(field, sanitizeSettings)
}

export async function createPost(req, res) {
    let { title, image, content, category, tags } = req.body 

    // validate all fields
    if (!title || !content || !category || !tags)
        return res.status(400).json({ error: 'All fields are required.' })

    // trim fields
    title = title.trim()
    content = content.trim()
    category = category.trim()

    // sanitize inputs
    title = sanitizeField(title)
    content = sanitizeField(content)
    category = sanitizeField(category)
    image = image ? sanitizeField(image) : ''

    try {
        const db = await getDBConnection()
        // validate category 
        const categoryExists = await db.get(
            `SELECT * FROM categories WHERE name = ?`,
            [category]
        )
        if(!categoryExists)
            return res.status(404).json({ error: 'Category does not exists.' })

        // Validate tags
        const tagsIds = []
        for (const tag of tags) {
            const tagExists = await db.get(
                `SELECT * FROM tags WHERE name = ?`,
                [tag]
            )

            if (!tagExists)
                return res.status(404).json({ error: `${tag} tag does not exist.` })

            tagsIds.push(tagExists.id)
        }

        // add post to DB
        const { lastID: postId } = await db.run(
            `INSERT INTO posts (title, image, content, category_id, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
            [title, image, content, categoryExists.id, new Date().toISOString(), new Date().toISOString()]
        )

        // Create association between post and tags
        for (const tagId of tagsIds) {
            await db.run(
                `INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)`,
                [postId, tagId]
            )
        }

        // Create post object for response
        const newPost = {
            id: postId,
            title,
            image,
            content,
            category,
            tags,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        // response successfully 
        res.status(201).json({ message: 'New post created.', post: newPost })
    } catch(error) {
        console.error('An error has ocurred trying to create a post, error:', error)
        res.status(500).json({ error: 'Error trying to create a post, try again.' })
    }
}

export async function updatePost(req, res) {
    // Get post id from params
    const { id: postId } = req.params
    
    // Validate ID
    if (!postId || isNaN(Number(postId))) 
        return res.status(400).json({ error: 'PUT method must have an ID param.' })

    // Get body
    let { title, image, content, category, tags } = req.body 
    
    // validate all fields
    if (!title || !content || !category || !tags)
        return res.status(400).json({ error: 'All fields are required.' })

    // trim fields
    title = title.trim()
    content = content.trim()
    category = category.trim()

    // sanitize fields
    title = sanitizeField(title)
    content = sanitizeField(content)
    category = sanitizeField(category)
    image = image ? sanitizeField(image) : ''

    try {
        const db = await getDBConnection()
        // validate category 
        const categoryExists = await db.get(
            `SELECT * FROM categories WHERE name = ?`,
            [category]
        )
        if(!categoryExists)
            return res.status(404).json({ error: 'Category does not exists.' })

        // Validate tags
        const tagsIds = []
        for (const tag of tags) {
            const tagExists = await db.get(
                `SELECT * FROM tags WHERE name = ?`,
                [tag]
            )

            if (!tagExists)
                return res.status(404).json({ error: `${tag} tag does not exist.` })

            tagsIds.push(tagExists.id)
        }

        // update post to DB
        await db.run(
            `
                UPDATE posts SET
                    title = ?,
                    image = ?,
                    content = ?,
                    category_id = ?,
                    updatedAt = ?
                WHERE id = ?
            `, [title, image, content, categoryExists.id, new Date().toISOString(), postId]
        )

        // Delete associations
        await db.run(`DELETE from post_tags WHERE post_id = ?`, [postId])

        // Create association between post and tags
        for (const tagId of tagsIds) {
            await db.run(
                `INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)`,
                [postId, tagId]
            )
        }

        // Get created time
        const { createdAt } = await db.get(`SELECT createdAt FROM posts WHERE id = ?`, [postId])

        // Create post object for response
        const updatedPost = {
            id: postId,
            title,
            image,
            content,
            category,
            tags,
            createdAt,
            updatedAt: new Date().toISOString()
        }
        // response successfully 
        res.status(200).json({ message: 'Post updated.', post: updatedPost })
    } catch(error) {
        console.error('An error has ocurred trying to create a post, error:', error)
        res.status(500).json({ error: 'Error trying to create a post, try again.' })
    }
}

export async function deletePost(req, res) {
    const { id: postId } = req.params
    
    // validate param
    if (!postId || isNaN(Number(postId))) 
        return res.status(400).json({ error: 'PUT method must have an ID param.' })

    try {
        const db = await getDBConnection()

        const postExists = await db.get(`SELECT * FROM posts WHERE id = ?`, [postId])
        if (!postExists) 
            return res.status(404).json({ error: 'Post not found.' })

        // Delete post
        await db.run(`DELETE FROM posts WHERE id = ?`, [postId])

        // Delete post from post_tags
        await db.run(`DELETE FROM post_tags WHERE post_id = ?`, [postId])

        // Response successfully 
        res.status(204).end()

    } catch(error) {
        console.error('An error has ocurred trying to delete a post, error: ', error)
        res.status(500).json({ error: 'An error has ocurred trying to delete a post, try again.' })
    }
}

export async function getPost(req, res) {
    // Get post id from params
    const { id: postId } = req.params
    
    // Validate ID
    if (!postId || isNaN(Number(postId))) 
        return res.status(400).json({ error: 'PUT method must have an ID param.' })

    try {
        const db = await getDBConnection()

        const post = await db.get(
            `
                SELECT
                    P.id,
                    P.title,
                    P.image,
                    P.content,
                    C.name as category,
                    P.createdAt,
                    P.updatedAt
                FROM posts P
                INNER JOIN categories C ON P.category_id = C.id 
                WHERE P.id = ?
            `, 
            [postId])
        if(!post) 
            return res.status(404).json({ error: 'Post not found.' })

        // Get tags
        const tagIds = (
            await db.all(`SELECT tag_id FROM post_tags WHERE post_id = ?`, [postId])
        ).map(({ tag_id }) => tag_id)

        const tags = []
        for (const tagId of tagIds) {
            const { name } = await db.get(`SELECT name FROM tags WHERE id = ?`, [tagId])
            tags.push(name)
        }

        // Add tags to post
        post.tags = tags
        
        // Response successfully
        res.json(post)
    } catch(error) {
        console.error('An error has ocurred trying to get a post, error:', error)
        res.status(500).json({ error: 'Error trying to get a post, try again.' })
    }
}

export async function getAllPosts(req, res) {
    try {
        const db = await getDBConnection()

        // get query
        let { term } = req.query // term could filter by title, content and category
        let query = ``
        if (term) {
            // Sanitize term
            term = sanitizeField(term)
            query = `WHERE P.title LIKE '%${term}%' OR P.content LIKE '%${term}%' OR C.name LIKE '%${term}%'`
        }

        const posts = await db.all(
            `
                SELECT
                    P.id,
                    P.title,
                    P.image,
                    P.content,
                    C.name as category,
                    P.createdAt,
                    P.updatedAt
                FROM posts P
                INNER JOIN categories C ON P.category_id = C.id
                ${query}
            `
        )
        
        for (const post of posts) {
            const tagIds = await db.all(`SELECT tag_id FROM post_tags WHERE post_id = ?`, [post.id])
            const tagNames = []
            for (const { tag_id: tagId } of tagIds) {
                const { name } = await db.get(`SELECT name FROM tags WHERE id = ?`, [tagId])
                tagNames.push(name)
            }
            post.tags = tagNames
        }

        res.json(posts)
    } catch(error) {
        console.error('An error has ocurred trying to get all posts, error:', error)
        res.status(500).json({ error: 'Error trying to get all posts, try again.' })
    }
}