const { verify } = require("jsonwebtoken")
const AppError = require("../utils/appError")
const authConfig = require("../configs/auth")

function ensureAuthenticated(request, response, next) {
    const authHeader = request.headers.authorization
    var isAdmin = 0

    if (!authHeader) {
        throw new AppError("JWT Token not sent", 401)
    }

    const [, token] = authHeader.split(" ");

    try {
        const { sub: user_id, role } = verify(token, authConfig.jwt.secret);

        request.user = {
            id: Number(user_id),
            role: role || 0,
        }

        if(role == 1 ) {
            isAdmin = true
        }

    } catch(error) {
        console.log(error)
        throw new AppError("Invalid JWT Token", 401)
    }

    if ((request.method === 'PUT' || request.method === 'POST') && (!isAdmin)) {
        throw new AppError("Not Authorized", 403);
    }

    return next()
}

module.exports = ensureAuthenticated;