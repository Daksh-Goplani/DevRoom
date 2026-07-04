import userModel from "../model/user.model.js";
import userService from "../service/user.service.js";
import { validationResult } from 'express-validator'
import redisClient from "../service/redis.service.js";

const createUserController = async (req, res) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const user = await userService.createUser(req.body)
        const token = await user.generateJWT()

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        })

        delete user._doc.password

        res.status(201).json({
            message: "User created success",
            user,
            token
        })
    } catch (error) {
        return res.status(400).send(error.message)
    }

}

const loginController = async (req, res) => {
    const error = validationResult(req)

    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() })
    }

    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            })
        }

        const user = await userModel.findOne({ email }).select("+password")

        if (!user) {
            return res.status(401).json({
                message: "Invalid Credentials"
            })
        }

        const isMatch = await user.isValidPassword(password)

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid Credentials"
            })
        }

        const token = await user.generateJWT()

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        })

        delete user._doc.password

        return res.status(200).json({
            message: "User logged in success",
            user,
            token
        })

    } catch (error) {
        console.log(error)
        res.status(400).send(error.message)
    }
}

const profileController = async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.user.email }).select('-password')
        if (!user) return res.status(404).json({ message: 'User not found' })

        res.status(200).json({
            user
        })
    } catch (err) {
        console.log(err)
        res.status(400).send(err.message)
    }
}

const logoutController = async (req, res) => {
    try {

        const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1]

        if (!token) {
            return res.status(400).json({
                message: "Already logged out"
            })
        }

        res.clearCookie('token');
        redisClient.set(token, "logout", "EX", 60 * 60 * 24)

        res.status(200).json({
            message: "Logged out successfully"
        })

    } catch (err) {
        console.log(err)
        res.status(400).send(err.message)
    }
}

const getAllUserController = async (req, res) => {
    try {
        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        const allUsers = await userService.getAllUsers({ userId: loggedInUser._id })

        return res.status(200).json({
            users: allUsers
        })
    } catch (err) {
        console.log(err)
        res.status(400).send(err.message)
    }
}

export default {
    createUserController,
    loginController,
    profileController,
    logoutController,
    getAllUserController
}