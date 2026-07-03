import { io } from 'socket.io-client'

let socketInstance = null

export const initializeSocket = () => {
    if (socketInstance) return socketInstance

    socketInstance = io(import.meta.env.VITE_API_URL, {
        withCredentials: true,
        transports: ['websocket'],
    })

    return socketInstance
}

export const receiveMessage = (eventName, cb) => {
    socketInstance.on(eventName, cb);
}

export const sendMessage = (eventName, data) => {
    socketInstance.emit(eventName, data);
}