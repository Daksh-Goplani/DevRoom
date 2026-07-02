import userModel from "../model/user.model.js";

const createUser = async ({ email, password }) => {
    if (!email || !password) {
        throw new Error("Email and password are required")
    }

    const hashPassword = await userModel.hashPassword(password)

    const user = await userModel.create({
        email,
        password: hashPassword
    })

    return user
}

const getAllUsers = async ({ userId }) => {
    const users = await userModel.find({
        _id: { $ne: userId }
    });
    return users;
}

export default {
    createUser,
    getAllUsers
}