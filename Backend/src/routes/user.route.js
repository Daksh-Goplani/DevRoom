import { Router } from 'express'
import userController from '../controller/user.controller.js'
import { body } from 'express-validator'
import authMiddleware from '../middleware/auth.middleware.js'

const router = Router()

router.post("/register",
    body('email').isEmail().withMessage("Email must be a valid email adress"),
    body('password').isLength({ min: 4 }).withMessage("Password must be atleast 4 character long"),
    userController.createUserController
)

router.post("/login",
    body('email').isEmail().withMessage("Email must be a valid email adress"),
    body('password').isLength({ min: 4 }).withMessage("Password must be atleast 4 character long"),
    userController.loginController
)

router.get("/profile",authMiddleware.authUser ,userController.profileController)

router.get("/logout",authMiddleware.authUser, userController.logoutController)

router.get("/all",authMiddleware.authUser, userController.getAllUserController)

export default router