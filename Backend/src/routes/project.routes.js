import { Router } from "express";
import { body } from "express-validator";
import projectController from '../controller/project.controller.js'
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router()

router.post('/create', 
    authMiddleware.authUser,
    body("name").isString().notEmpty().withMessage("Name is required"),
    projectController.projectControlle
)

export default router