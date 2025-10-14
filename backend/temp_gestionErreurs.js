"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.gestionErreurs = exports.ApiError = void 0;
class ApiError extends Error {
    statusCode;
    isOperational;
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
exports.ApiError = ApiError;
const gestionErreurs = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            erreur: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }
    // Erreurs inattendues
    console.error('Erreur inattendue:', err);
    return res.status(500).json({
        erreur: 'Erreur serveur interne',
        ...(process.env.NODE_ENV === 'development' && {
            message: err.message,
            stack: err.stack
        })
    });
};
exports.gestionErreurs = gestionErreurs;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
