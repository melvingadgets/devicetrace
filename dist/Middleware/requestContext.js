"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestContextMiddleware = void 0;
const uuid_1 = require("uuid");
const logger_1 = require("../config/logger");
const requestContextMiddleware = (req, res, next) => {
    const headerValue = req.header('x-correlation-id');
    const correlationId = typeof headerValue === 'string' && headerValue.trim() !== '' ? headerValue : (0, uuid_1.v4)();
    req.correlationId = correlationId;
    req.logger = logger_1.logger.child({
        correlationId,
        request: {
            method: req.method,
            path: req.path,
            ip: req.ip,
        },
    });
    res.setHeader('x-correlation-id', correlationId);
    next();
};
exports.requestContextMiddleware = requestContextMiddleware;
//# sourceMappingURL=requestContext.js.map