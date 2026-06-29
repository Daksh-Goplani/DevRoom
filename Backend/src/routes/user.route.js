import { Router } from 'express'
import userController from '../controller/user.controller.js'
import { body } from 'express-validator'

const router = Router()

router.post("/register",
    body('email').isEmail().withMessage("Email must be a valid email adress"),
    body('password').isLength({ min: 4 }).withMessage("Password must be atleast 4 character long"),
    userController.createUserController)

export default router