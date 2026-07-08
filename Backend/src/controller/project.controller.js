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
        const { name } = req.body
        const loggedInUser = await userModel.findOne({ email: req.user.email })
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

const getAllProjects = async (req, res) => {
    try {
        const loggedInUser = await userModel.findOne({ email: req.user.email })

        const allUserProjects = await projectService.getAllProjectByUserId({
            userId: loggedInUser._id
        })
        return res.status(200).json({
            message: "Projects fetched successfully",
            Projects: allUserProjects
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message })
    }
}

const addUserToProject = async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const { projectId, users } = req.body

        const loggedInUser = await userModel.findOne({ email: req.user.email })

        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: loggedInUser._id
        })

        return res.status(200).json({
            message: "New user added successfully",
            project
        })

    } catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message })
    }
}

const getProjectById = async (req, res) => {

    const { projectId } = req.params

    try {
        const project = await projectService.getProjectByIdService({projectId})

        return res.status(200).json({
            message: "Project fetched success",
            project
        })

    } catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message })
    }
}

const updateFileTree = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { projectId, fileTree } = req.body;

        const project = await projectService.updateFileTree({
            projectId,
            fileTree
        })

        return res.status(200).json({
            project
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }
}

export default {
    projectControlle,
    getAllProjects,
    addUserToProject,
    getProjectById,
    updateFileTree
}