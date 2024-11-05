import * as oauth from 'oauth4webapi';
import { env } from '@/env.js';
import GoogleDiscoveryDocument from '@/json/discovery.google.json';
import { get_OICD_Token, get_OICD_Auth, type OICD_Auth_Handler, type ProviderOptions, type OICD_Token_Handler } from '@/middlewares/oicd.middleware.js';

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

export const googleAuth: OICD_Auth_Handler[] = [
    get_OICD_Auth(provider),
    async (_req, res) => {
        res.json(res.locals.oicd);
    }
];

export const googleCallback: OICD_Token_Handler[] = [
    get_OICD_Token(provider),
    async (_req, res) => {
        const claims = res.locals.oicd.claims as GoogleIDToken;
        const db = res.locals.db;
        res.json(claims);
    }
]
