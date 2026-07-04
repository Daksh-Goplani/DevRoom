import { io } from 'socket.io-client'

let socketInstance = null

export const initializeSocket = (projectId) => {
    if (socketInstance && socketInstance.io?.opts?.query?.projectId === projectId) {
        return socketInstance
    }

    if (socketInstance) {
        socketInstance.disconnect()
        socketInstance = null
    }

    socketInstance = io(import.meta.env.VITE_API_URL, {
        withCredentials: true,
        transports: ['websocket'],
        query: {
            projectId
        }
    })

    return socketInstance
}

export const receiveMessage = (eventName, cb) => {
    if (!socketInstance) return
    socketInstance.on(eventName, cb)
}

export const offMessage = (eventName, cb) => {
    if (!socketInstance) return
    socketInstance.off(eventName, cb)
}

export const sendMessage = (eventName, data) => {
    if (!socketInstance) return
    socketInstance.emit(eventName, data)
}

export const disconnectSocket = () => {
    // if (!socketInstance) return
    // socketInstance.disconnect()
    // socketInstance = null
}
