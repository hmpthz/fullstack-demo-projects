import { type RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/env.js';
import type { UserToken } from '../auth/auth.middleware.js';

const SUPABASE_AUTH_LIFESPAN = 5 * 60;

export const supabaseStorage: RequestHandler[] = [
    (_req, res) => {
        const issuedAt = Math.floor(Date.now() / 1000);
        const expiredAt = issuedAt + SUPABASE_AUTH_LIFESPAN;
        const accessToken = jwt.sign(
            { iat: issuedAt, exp: expiredAt, role: 'authenticated' }, env.SUPABASE_JWT_SECRET
        );
        const resBody: UserToken = { s: accessToken, expiredAt };
        res.json(resBody);
    }
]