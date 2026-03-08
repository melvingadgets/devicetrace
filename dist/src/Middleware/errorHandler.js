"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../config/logger");
const errors_1 = require("../utils/errors");
const errorHandler = (error, req, res, _next) => {
    const requestLogger = req.logger ?? logger_1.logger;
    const statusCode = error instanceof errors_1.AppError ? error.statusCode : 500;
    const code = error instanceof errors_1.AppError ? error.code : 'INTERNAL_ERROR';
    const responsePayload = {
        success: false,
        code,
        error: error instanceof errors_1.AppError ? error.message : 'Internal server error',
        ...(error instanceof errors_1.AppError && error.details ? { details: error.details } : {}),
    };
    requestLogger.error({
        statusCode,
        path: req.path,
        method: req.method,
        errorName: error?.name,
        errorMessage: error?.message,
    }, 'Request failed');
    res.status(statusCode).json(responsePayload);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map