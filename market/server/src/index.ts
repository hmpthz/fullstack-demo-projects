import express from 'express';
import { connectDatabase, disconnectDatabase } from './utils/db.js';
import { apiRouter } from './api/index.js';
import { env } from './env.js';
import { errorHandler } from './middlewares/error.middleware.js';

async function main() {
    env.validate();

    const app = express();
    app.locals.db = await connectDatabase();
    app.use((_req, res, next) => {
        if (env.VERCEL_ENV != undefined) {
            // if deployed on vercel as functions, disconnect when each request ends
            res.on('finish', disconnectDatabase);
        }
        next();
    });

    app.use(express.json());
    app.use('/api', apiRouter);

    app.get('/api/hello', (req, res, next) => {

    });

    app.use(errorHandler);
    return app;
}

export default main();