import type { HandledError } from '@/utils/createError.js';
import { type ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    let { name, message, statusCode } = err as HandledError;
    statusCode ??= 500;
    const errorMessage = `${name}: ${message}`
    console.error(errorMessage);
    res.status(statusCode).json({ error: errorMessage });
}