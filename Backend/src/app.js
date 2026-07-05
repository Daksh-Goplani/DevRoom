import express from 'express'
import morgan from 'morgan'
import connedtDb from './config/db.js'
import userRoute from './routes/user.route.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import config from './config/config.js'
import projectRoute from './routes/project.routes.js'
import aiRoutes from './routes/ai.routes.js'


connedtDb()
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
app.use("/projects", projectRoute)
app.use("/ai", aiRoutes)

export default app