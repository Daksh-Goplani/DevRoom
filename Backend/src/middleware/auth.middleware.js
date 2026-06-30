import jwt from 'jsonwebtoken'
import config from '../config/config.js'
import redisClient from '../controller/redis.service.js'

const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization.split(' ')[1]

        if (!token) {
            return res.status(401).json({ message: "Unauthorized user" })
        }

        const isBlackListed = await redisClient.get(token)

        if(isBlackListed){
            res.cookie('token', '')
            return res.status(401).send({error: 'Unauthorized User'})
        }

        const decoded = jwt.verify(token, config.JWT_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        res.status(401).json({ message: "Please authenticate" })
    }
}

export default {
    authUser
}