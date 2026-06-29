import mongoose from 'mongoose'
import config from './config.js'

async function connedtD() {
    mongoose.connect(config.MONGO_URI)
        .then(() => {
            console.log("Connected to db")
        })
        .catch(err => {
            console.log(`Error connecting db ${err}`)
        })
}

export default connedtD