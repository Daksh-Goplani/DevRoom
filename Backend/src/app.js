import express from 'express'
import morgan from 'morgan'
import connedtD from './config/db.js'
import userRoute from './routes/user.route.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import config from './config/config.js'


connedtD()
const app = express()

app.use(cors({
    origin: config.CLIENT_URL,
    credentials: true,
}));
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use("/auth", userRoute)

export default app