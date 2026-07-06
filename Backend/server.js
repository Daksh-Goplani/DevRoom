import app from './src/app.js'
import http from 'http'
import config from './src/config/config.js'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import projectModel from './src/model/project.model.js'
import { generateResult } from './src/service/ai.service.js'

const parseCookies = (cookieHeader = '') =>
    cookieHeader
        .split(';')
        .map(cookie => cookie.trim())
        .filter(Boolean)
        .reduce((acc, cookie) => {
            const [name, ...rest] = cookie.split('=')
            if (!name) return acc
            acc[name] = decodeURIComponent(rest.join('='))
            return acc
        }, {})

const server = http.createServer(app)
const port = config.PORT || 3001
const io = new Server(server, {
    cors: {
        origin: config.CLIENT_URL,
        credentials: true
    }
})

io.use(async (socket, next) => {
    try {
        const cookies = parseCookies(socket.handshake.headers.cookie || '')
        const token =
            socket.handshake.auth?.token ||
            cookies.token ||
            socket.handshake.headers.authorization?.split(' ')[1]

        const projectId = socket.handshake.query.projectId

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error('Invalid projectId'));
        }

        socket.project = await projectModel.findById(projectId);

        if (!token) {
            return next(new Error('Authentication error'))
        }

        const decoded = jwt.verify(token, config.JWT_SECRET)
        socket.user = decoded
        next()
    } catch (error) {
        next(new Error('Authentication error'))
    }
})

io.on('connection', socket => {
    socket.roomId = socket.project._id.toString()

    console.log('a user connected')
    socket.join(socket.roomId)

    socket.on('project-message', async data => {

        const message = data.message
        const aiIsPresentInMessage = message.includes('@ai');
        socket.broadcast.to(socket.roomId).emit('project-message', data)

        if (aiIsPresentInMessage) {


            const prompt = message.replace('@ai', '');
            const result = await generateResult(prompt);


            io.to(socket.roomId).emit('project-message', {
                message: result,
                sender: {
                    _id: 'ai',
                    email: 'AI'
                }
            })
            return
        }
    })

    socket.on('disconnect', () => {
        console.log('user disconnected')
        socket.leave(socket.roomId)
    })
})

server.listen(port, () => {
    console.log('Server is running on Port', port)
})