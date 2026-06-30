import jwt from 'jsonwebtoken'
import config from '../config/config.js'

const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization.split(' ')[1]

        if (!token) {
            return res.status(401).json({ message: "Unauthorized user" })
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