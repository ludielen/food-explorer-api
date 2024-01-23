const { hash, compare} = require("bcryptjs")

const appError = require("../utils/appError")

const sqliteConnection = require("../database/sqlite")

class UsersController {
    async create(request, response) {
        const {name, email, password, isAdmin} = request.body

        const database = await sqliteConnection()

        const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email])

        if(checkUserExists) {
            throw new appError("Email already exist", 409)
        }

        const hashedPassword =  await hash(password, 8)
        const isAdminValue = isAdmin ? 1 : 0;

        await database.run("INSERT INTO users (name, email, password, isAdmin) VALUES (?, ?, ?, ?)", [name, email, hashedPassword, isAdminValue])

        return response.status(201).json()
    }
}

function validateDuplicateEmail(userWithUpdateEmail, userRegistered) {
    return userWithUpdateEmail && userWithUpdateEmail.id !== userRegistered.id
}

module.exports = UsersController