import * as oauth from 'oauth4webapi';
import crypto from 'node:crypto';
import bcryptjs from 'bcryptjs';
import { env } from '@/env.js';
import GoogleDiscoveryDocument from '@/json/discovery.google.json';
import { oicd_tokenHandler, oicd_authHandler, type OICD_AuthHandler, type ProviderOptions, type OICD_TokenHandler, type OICD_Token_Locals } from './oicd.middleware.js';
import type { RequestHandler } from 'express';
import { sessionHandler, tokenRefreshHandler, type OICD_SessionHandler, type SessionHandler, type Session_Locals } from './auth.middleware.js';
import { userModel } from '@/models/user.model.js';

const provider = () => ({
    issuer_url: 'https://accounts.google.com',
    discovery: GoogleDiscoveryDocument,
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    redirect_uri: `${env.APP_URL}/sign-in/google`,
    scope: 'openid email profile',
    code_challenge_method: 'S256'
} as ProviderOptions);

interface GoogleIDToken extends oauth.IDToken {
    email: string;
    email_verified: boolean;
    name: string;
    picture?: string;
}

export const googleAuth: [OICD_AuthHandler, OICD_AuthHandler] = [
    oicd_authHandler(provider),
    async (_req, res) => {
        res.json(res.locals.oicd);
    }
];

export const googleCallback: [OICD_TokenHandler, OICD_SessionHandler, SessionHandler, SessionHandler] = [
    oicd_tokenHandler(provider),
    async (_req, res, next) => {
        const claims = res.locals.oicd.claims as GoogleIDToken;
        const foundUser = await userModel.findOne({
            $or: [
                { 'credentials.issuer': 'google', 'credentials.sub': claims.sub },
                { email: claims.email }
            ]
        });
        if (foundUser) {
            res.locals.user = foundUser;
            const foundCredential = foundUser.credentials.find(
                item => item.issuer == 'google' && item.sub == claims.sub
            );
            if (!foundCredential) {
                // there is an user with the email in OAuth information
                // but OAuth credential does not exist
                foundUser.credentials.push({ issuer: 'google', sub: claims.sub });
            }
        }
        else {
            const randString = crypto.randomBytes(20).toString('hex');
            const randPassword = randString.slice(0, 16);
            const hashedPassword = bcryptjs.hashSync(randPassword, 10);
            const randPosfix = randString.slice(-4);

            const newUser = new userModel({
                email: claims.email,
                username: `${claims.name.split(' ').join('')}_${randPosfix}`,
                password: hashedPassword,
                avatar: claims.picture ?? '/blank-profile.png',
                credentials: [{ issuer: 'google', sub: claims.sub }]
            });
            // wait for token refresh handler to save
            // await newUser.save();
            res.locals.user = newUser;
        }
        return next();
    },
    sessionHandler,
    tokenRefreshHandler(true)
];