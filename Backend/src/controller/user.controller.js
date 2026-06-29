import userModel from "../model/user.model.js";
import userService from "../service/user.service.js";
import {validationResult} from 'express-validator'

const createUserController = async (req, res)=>{

    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    try {
        const user = await userService.createUser(req.body)
        const token = await user.generateJWT()

        res.status(201).json({
            message: "User created success",
            user,
            token
        })
    } catch (error) {
        return res.status(400).send(error.message)
    }

}

export default {
    createUserController
}