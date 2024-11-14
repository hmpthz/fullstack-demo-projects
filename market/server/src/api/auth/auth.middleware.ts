import { type RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import type { UserDoc } from '@/models/user.model.js';
import { env } from '@/env.js';

const ACCESSTOKEN_LIFESPAN = 5 * (1000 * 60);
const SESSION_LIFESPAN = 20 * (1000 * 60);

interface Session_Locals {
    user: UserDoc;
}
export type SessionHandler<ReqBody> = RequestHandler<object, object, ReqBody, object, Session_Locals>;

/** Create a new session with empty refresh token */
export const sessionHandler: SessionHandler<unknown> =
    async (_req, res, next) => {
        const user = res.locals.user;
        const expiredAt = Date.now() + SESSION_LIFESPAN;
        if (!user.session) {
            user.session = { refreshToken: '', expiredAt };
        }
        else {
            user.session.refreshToken = '';
            user.session.expiredAt = expiredAt;
        }
        next();
    }

interface TokenRefresh_Response {
    accessToken: string;
    expiredAt: number;
    profile: {
        username: string
    }
}
/** Return a new access token */
export const tokenRefreshHandler: (newRefreshToken: boolean) => SessionHandler<unknown> =
    (newRt) => async (_req, res) => {
        const user = res.locals.user;
        // session must exist
        const session = user.session!;
        // by default, only access token is returned
        let statusCode = 200;

        if (newRt) {
            session.refreshToken = crypto.randomBytes(16).toString('hex');
            await user.save();
            res.cookie(
                'refresh_token', session.refreshToken,
                { httpOnly: true, sameSite: 'strict', maxAge: (session.expiredAt - Date.now()) }
            );
            // server has created a new refresh token in database
            statusCode = 201;
        }

        const accessToken = jwt.sign(
            {}, env.JWT_SECRET,
            { subject: user.id, expiresIn: ACCESSTOKEN_LIFESPAN.toString() }
        );
        const expiredAt = Date.now() + ACCESSTOKEN_LIFESPAN;
        res.status(statusCode).json({
            accessToken,
            expiredAt,
            profile: { username: user.username }
        } as TokenRefresh_Response);
    }