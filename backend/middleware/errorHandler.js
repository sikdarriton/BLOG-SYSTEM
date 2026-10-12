
function errorHandler(err, req, res, next) {
    let statusCode = err.statusCode || 500;
    let code = err.code || "INTERNAL_SERVER_ERROR";
    let message = err.message || "Internal server error";

    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        code = "INVALID_ID";
        message = "Invalid resource ID";
    }

    // Duplicate unique field, e.g. registered email
    if (err.code === 11000) {
        statusCode = 409;
        code = "DUPLICATE_RESOURCE";
        message = "A record with this value already exists";
    }

    // Mongoose schema validation
    if (err.name === "ValidationError") {
        statusCode = 400;
        code = "VALIDATION_ERROR";
        message = Object.values(err.errors)
            .map(item => item.message)
            .join(", ");
    }

    // Log details internally
    console.error(err);

    res.status(statusCode).json({
        success: false,
        error: {
            code,
            message:
                statusCode >= 500
                    ? "Internal server error"
                    : message
        }
    });
}

module.exports = errorHandler;
