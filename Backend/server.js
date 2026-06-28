import app from './src/app.js'
import http from 'http'
import config from './src/config/config.js'

const server = http.createServer(app)
const port = config.PORT || 3000

server.listen(port, ()=>{
    console.log('Server is running on Port', port)
})