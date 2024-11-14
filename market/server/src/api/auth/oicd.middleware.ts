import { createError } from '@/utils/createError.js';
import { type RequestHandler } from 'express';
import * as oauth from 'oauth4webapi';

export interface ProviderOptions {
    /** exclude '.well-known/openid-configuration' */
    issuer_url: string;
    /** prefetched from discovery document so you don't have to retrieve every time */
    discovery?: oauth.AuthorizationServer;
    client_id: string;
    client_secret: string;
    redirect_uri: string;
    scope: string;
    code_challenge_method: string;
}

/**
 * Data that will be kept on client and sent back to server for auth code grant
 */
interface OICD_Auth_Context {
    code_verifier: string;
    nonce?: string;
}
interface OICD_Auth_Locals {
    oicd: {
        ctx: OICD_Auth_Context,
        auth_url: string
    };
}
export type OICD_AuthHandler = RequestHandler<object, object, object, object, OICD_Auth_Locals>;

export function oicd_authHandler(optionsGetter: () => ProviderOptions) {
    const middleware: OICD_AuthHandler = async (_req, res, next) => {
        const opts = optionsGetter();
        const discovery = await getDiscoveryDocument(opts);
        if (!discovery.authorization_endpoint) {
            return next(createError('Discovery', 'authorization_endpoint not found', 404));
        }
        const auth_endpoint = discovery.authorization_endpoint;
        const code_challenge_method_supported =
            discovery.code_challenge_methods_supported?.includes(opts.code_challenge_method) === true;

        /**
         * The following MUST be generated for every redirect to the authorization_endpoint. You must store
         * the code_verifier and nonce in the end-user session such that it can be recovered as the user
         * gets redirected from the authorization server back to your application.
         */
        const ctx: OICD_Auth_Context = {
            code_verifier: oauth.generateRandomCodeVerifier()
        };

        const params: Record<string, string> = {
            'client_id': opts.client_id,
            'redirect_uri': opts.redirect_uri,
            'response_type': 'code',
            'scope': opts.scope
        };
        /**
         * We cannot be sure the AS supports PKCE so we're going to use nonce too. Use of PKCE is
         * backwards compatible even if the AS doesn't support it which is why we're using it regardless.
         */
        if (code_challenge_method_supported) {
            const code_challenge = await oauth.calculatePKCECodeChallenge(ctx.code_verifier);
            params['code_challenge'] = code_challenge;
            params['code_challenge_method'] = opts.code_challenge_method;
        }
        else {
            ctx.nonce = oauth.generateRandomNonce();
            params['nonce'] = ctx.nonce;
        }

        const auth_url = new URL(auth_endpoint);
        for (const [key, val] of Object.entries(params)) {
            auth_url.searchParams.set(key, val);
        }
        res.locals.oicd = {
            ctx,
            auth_url: auth_url.href
        };
        return next();
    };
    return middleware;
}

interface OICD_Token_Request extends OICD_Auth_Context {
    params: Record<string, string>;
}
interface OICD_Token_Locals {
    oicd: {
        claims: oauth.IDToken,
        access_token: string
    };
}
export type OICD_TokenHandler = RequestHandler<object, object, OICD_Token_Request, object, OICD_Token_Locals>;

export function oicd_tokenHandler(optionsGetter: () => ProviderOptions) {
    const middleware: OICD_TokenHandler = async (req, res, next) => {
        const opts = optionsGetter();
        const discovery = await getDiscoveryDocument(opts);
        const client: oauth.Client = { client_id: opts.client_id };
        const clientAuth = oauth.ClientSecretPost(opts.client_secret);

        const params = oauth.validateAuthResponse(
            discovery, client, new URLSearchParams(req.body.params)
        );
        const response = await oauth.authorizationCodeGrantRequest(
            discovery, client, clientAuth, params, opts.redirect_uri, req.body.code_verifier
        );
        const tokenResult = await oauth.processAuthorizationCodeResponse(
            discovery, client, response,
            { expectedNonce: req.body.nonce, requireIdToken: true }
        );

        const claims = oauth.getValidatedIdTokenClaims(tokenResult);
        if (!claims) {
            return next(createError('ID_Token', 'Failed to find valid token claims', 404));
        }
        res.locals.oicd = {
            claims,
            access_token: tokenResult.access_token
        };
        return next();
    }
    return middleware;
}

async function getDiscoveryDocument(opts: ProviderOptions) {
    if (opts.discovery) {
        return opts.discovery;
    }
    const issuer = new URL(opts.issuer_url);
    const response = await oauth.discoveryRequest(issuer, { algorithm: 'oidc' });
    return await oauth.processDiscoveryResponse(issuer, response);
}
