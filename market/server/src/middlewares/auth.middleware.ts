import { type RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '@/env.js';
import type { UserDoc, UserProfile } from '@/models/user.model.js';
import type { OICD_Token_Locals } from '@/api/auth/oicd.middleware.js';
import { HandledError } from '@/utils/errors.js';

interface Private_Locals {
    userId: string;
}
export type PrivateHandler<ReqBody = object, ReqParams = object> = RequestHandler<ReqParams, object, ReqBody, object, Private_Locals>;

/** Authenticate access token */
export const privateHandler: PrivateHandler = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return next(HandledError.list['auth|no_at|401']);
    }
    const [authType, authToken] = authHeader.split(' ');
    if (authType != 'Bearer') {
        return next(HandledError.list['auth|invalid_at|401']);
    }
    try {
        const payload = jwt.verify(authToken, env.JWT_SECRET, { complete: false });
        if (typeof payload == 'string' || !payload.sub) {
            return next(HandledError.list['auth|invalid_at|401']);
        }
        res.locals.userId = payload.sub;
        return next();
    }
    catch (err) {
        if ((err as Error).name == 'TokenExpiredError')
            return next(HandledError.list['auth|at_expired|403']);
        else
            return next(HandledError.list['auth|invalid_at|401']);
    }
}


// seconds
const ACCESSTOKEN_LIFESPAN = 5 * 60;
const SESSION_LIFESPAN = 24 * 60 * 60;

interface Session_Locals {
    user: UserDoc;
}
export type SessionHandler<ReqBody = object> = RequestHandler<object, object, ReqBody, object, Session_Locals>;
export type OICD_SessionHandler = RequestHandler<object, object, object, object, OICD_Token_Locals & Session_Locals>;

/** Create a new session with empty refresh token */
export const sessionHandler: SessionHandler =
    async (_req, res, next) => {
        const user = res.locals.user;
        const expiredAt = Date.now() + SESSION_LIFESPAN * 1000;
        if (!user.session) {
            user.session = { refreshToken: '', expiredAt };
        }
        else {
            user.session.refreshToken = '';
            user.session.expiredAt = expiredAt;
        }
        return next();
    }


export interface UserToken {
    s: string,
    expiredAt: number
}
interface TokenRefresh_Response {
    accessToken: UserToken;
    profile: UserProfile;
}

/** Return a new access token */
export const tokenRefreshHandler: (newRefreshToken: boolean) => SessionHandler =
    (newRt) => async (_req, res) => {
        const user = res.locals.user;
        // session must exist
        const session = user.session!;
        // by default, only access token is returned
        let statusCode = 200;

        if (newRt) {
            session.refreshToken = crypto.randomBytes(16).toString('hex');
            await user.save();
            const maxAge = (session.expiredAt - Date.now());
            res.cookie(
                'refresh_token', session.refreshToken,
                { httpOnly: true, sameSite: 'strict', maxAge }
            );
            res.cookie(
                'has_refresh_token', 1,
                { httpOnly: false, sameSite: 'none', maxAge, secure: true }
            );

            // server has created a new refresh token in database
            statusCode = 201;
        }

        const issuedAt = Math.floor(Date.now() / 1000);
        const expiredAt = issuedAt + ACCESSTOKEN_LIFESPAN;
        const accessToken = jwt.sign(
            { iat: issuedAt, exp: expiredAt, sub: user.id }, env.JWT_SECRET
        );
        const resBody: TokenRefresh_Response = {
            accessToken: { s: accessToken, expiredAt },
            profile: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatar: user.avatar
            }
        };
        res.status(statusCode).json(resBody);
    }