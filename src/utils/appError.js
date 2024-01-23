class appError {
    message
    statusCode

    constructor(message, statusCode) {
        this.message = message
        this.statusCode = statusCode
    }
}

module.exports = appError