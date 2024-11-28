import jwt from 'jsonwebtoken';
import { HandledError } from '@/utils/errors.js';
import { privateHandler, tokenRefreshHandler, type PrivateHandler, type SessionHandler, type UserToken } from '@/middlewares/auth.middleware.js';
import { userModel } from '@/models/user.model.js';
import { env } from '@/env.js';

export const tokenRefresh: SessionHandler[] = [
    async (req, res, next) => {
        const refreshToken: string | undefined = req.cookies['refresh_token'];
        if (!refreshToken) {
            return next(HandledError.list['session|no_refresh_token|401']);
        }
        const foundUser = await userModel.findOne({ 'session.refreshToken': refreshToken });
        if (!foundUser) {
            return next(HandledError.list['session|invalid_refresh_token|401']);
        }
        if (Date.now() >= foundUser.session!.expiredAt) {
            return next(HandledError.list['session|expired|403']);
        }
        res.locals.user = foundUser;
        next();
    },
    tokenRefreshHandler(false)
];

const SUPABASE_AUTH_LIFESPAN = 5 * 60;

export const tokenSupabase: PrivateHandler[] = [
    privateHandler,
    (_req, res) => {
        const issuedAt = Math.floor(Date.now() / 1000);
        const expiredAt = issuedAt + SUPABASE_AUTH_LIFESPAN;
        const accessToken = jwt.sign(
            { iat: issuedAt, exp: expiredAt, role: 'authenticated' }, env.SUPABASE_JWT_SECRET
        );
        const resBody: UserToken = { s: accessToken, expiredAt };
        res.json(resBody);
    }
];