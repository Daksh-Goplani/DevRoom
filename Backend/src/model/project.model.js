import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        lowercase: true,
        required: [true, "Project name is required"],
        unique: [true, "Project name Already Exist"],
        trim: true
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ]
})

const projectModel = mongoose.model("project", projectSchema)

export default projectModel