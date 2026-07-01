import projectModel from "../model/project.model.js";

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

export default {
    createProject
}