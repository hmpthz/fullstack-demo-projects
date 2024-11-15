import { type RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import type { UserDoc } from '@/models/user.model.js';
import { env } from '@/env.js';

const ACCESSTOKEN_LIFESPAN = 5 * (1000 * 60);
const SESSION_LIFESPAN = 20 * (1000 * 60);

export interface Session_Locals {
    user: UserDoc;
}
export type SessionHandler<ReqBody = object> = RequestHandler<object, object, ReqBody, object, Session_Locals>;

/** Create a new session with empty refresh token */
export const sessionHandler: SessionHandler =
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
        return next();
    }

interface UserProfile {
    username: string;
    email: string;
    avatar: string;
}
interface TokenRefresh_Response {
    accessToken: string;
    expiredAt: number;
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
        const resBody: TokenRefresh_Response = {
            accessToken,
            expiredAt,
            profile: {
                username: user.username,
                email: user.email,
                avatar: user.avatar
            }
        };
        res.status(statusCode).json(resBody);
    }