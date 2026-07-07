import projectModel from "../model/project.model.js";
import userModel from "../model/user.model.js";
import mongoose from 'mongoose';

const createProject = async ({ name, userId }) => {
    if (!name || !userId) {
        throw new Error("Name and userId are required")
    }

    let project;
    try {
        project = await projectModel.create({
            name,
            users: [userId]
        });
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Project name already exists');
        }
        throw error;
    }

    return project
}

const getAllProjectByUserId = async ({ userId }) => {
    if (!userId) {
        throw new Error("User Id is required")
    }
    const allUserProjects = await projectModel.find({
        users: userId
    })
    return allUserProjects
}

const addUsersToProject = async ({ projectId, users, userId }) => {
    console.log(projectId, users, userId)
    if (!projectId) {
        throw new Error("Project Id is required")
    }

    if (!users) {
        throw new Error("Users are required")
    }

    if (!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))) {
        throw new Error("Invalid userId(s) in users array")
    }

    if (!userId) {
        throw new Error("userId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId")
    }

    const project = await projectModel.findOne({
        _id: projectId,
        users: userId
    })

    console.log(project)

    if (!project) {
        throw new Error("User not belong to this project")
    }

    const updatedProject = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        $addToSet: {
            users: {
                $each: users
            }
        }
    }, {
        new: true
    }).populate('users')

    return updatedProject
}

const getProjectByIdService = async ({projectId})=>{
    if(!projectId){
        throw new Error("Project Id is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    const project = await projectModel.findOne({
        _id: projectId
    }).populate('users')

    return project;
}

const updateFileTree = async ({ projectId, fileTree }) => {
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (!fileTree) {
        throw new Error("fileTree is required")
    }

    const project = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        fileTree
    }, {
        new: true
    })

    return project;
}

export default {
    createProject,
    getAllProjectByUserId,
    addUsersToProject,
    getProjectByIdService,
    updateFileTree
}