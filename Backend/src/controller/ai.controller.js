import * as ai from '../service/ai.service.js'

const getResult = async(req,res)=>{
    try {
        const {prompt} = req.query
        const result = await ai.generateResult(prompt)
        res.send(result)
    } catch (error) {
        res.status(500).send({error: error.message})
    }
}

export default {
    getResult
}