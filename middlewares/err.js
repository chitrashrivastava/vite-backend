
exports.generatedErrors = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    if (err.name === 'MongoServerError' && err.message.includes('E11000 duplicate key')) {
        err.message = `${err.keyValue.email} is already registered`
    }
    res.status(statusCode).json({
        message: err.message,
        errorname: err.name,
        // stack: err.stack // Use err.stack instead of err.name for the stack trace
    });
}