import crypto from 'node:crypto'

const randomBuf = crypto.randomBytes(64).toString('hex')
console.log(randomBuf)