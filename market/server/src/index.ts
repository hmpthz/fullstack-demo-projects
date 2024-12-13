import express from 'express';
import cookieParser from 'cookie-parser';
import { connectDatabase } from './utils/db.js';
import { apiRouter } from './api/index.js';
import { env } from './env.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { SupabaseUtils } from './utils/supabase.js';

function main() {
    env.validate();
    const app = express();

    app.use(async (_req, res, next) => {
        res.locals.db = await connectDatabase();
        res.locals.supabaseUtils = new SupabaseUtils();
        return next();
    });

    app.use(express.json());
    app.use(cookieParser());
    app.use('/api', apiRouter);

    app.get('/api/hello', (_req, res) => {
        const conn = res.locals.db.connection;
        res.json({ host: conn.host, port: conn.port, dbName: conn.db?.databaseName, name: conn.name });
    });

    app.use(errorHandler);
    return app;
}

export default main();