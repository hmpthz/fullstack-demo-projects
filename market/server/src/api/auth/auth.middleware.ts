import { type RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '@/env.js';
import type { UserDoc } from '@/models/user.model.js';
import type { OICD_Token_Locals } from './oicd.middleware.js';

// seconds
const ACCESSTOKEN_LIFESPAN = 5 * 60;
const SESSION_LIFESPAN = 24 * 60 * 60;

export interface Session_Locals {
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
interface UserProfile {
    id: string;
    username: string;
    email: string;
    avatar: string;
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
                username: user.username,
                email: user.email,
                avatar: user.avatar
            }
        };
        res.status(statusCode).json(resBody);
    }