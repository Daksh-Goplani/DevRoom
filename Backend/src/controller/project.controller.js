import projectModel from "../model/project.model.js";
import userModel from "../model/user.model.js";
import projectService from "../service/project.service.js";
import { validationResult } from "express-validator";

const projectControlle = async (req, res) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        console.log(req.user, 'user')
        const { name } = req.body
        const loggedInUser = await userModel.findOne( {email: req.user.email} )
        const userId = loggedInUser._id

        const newProject = await projectService.createProject({ name, userId })

        res.status(201).json({
            message: "Project created Successfully",
            newProject
        })

    } catch (error) {
        console.log(error)
        res.status(400).send(error.message)
    }
}

export default {
    projectControlle
}