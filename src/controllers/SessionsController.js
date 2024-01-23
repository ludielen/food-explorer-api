const knex = require("../database/knex")
const AppError = require("../utils/appError")
const authConfig = require("../configs/auth")
const { sign} = require("jsonwebtoken")
const {compare} = require("bcryptjs")

class SessionsController {
    async create(request, response) {
        const {email, password} = request.body

        const user = await knex("users").where({email}).first();


        if(!user){
            throw new AppError("E-mail and/or password incorrect");
        }

        const passwordMatched = await compare(password, user.password)

        if(!passwordMatched){
            throw new AppError("E-mail and/or password incorrect")
        }

        const {secret, expiresIn} = authConfig.jwt

        const token = sign({ role: user.isAdmin }, secret, {
            subject: String(user.id),
            expiresIn
        })

        return response.status(200).json({user, token})
    }
}

module.exports = SessionsController;