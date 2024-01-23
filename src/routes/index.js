const {Router} = require("express")
const platesRoutes = require("./platesRoutes")
const usersRoutes = require("./usersRoutes")
const sessionsRouter = require("./SessionsRoutes")

const routes = Router()
routes.use("/plates", platesRoutes)
routes.use("/users", usersRoutes)
routes.use("/sessions", sessionsRouter)

module.exports = routes