import axios from 'axios';
import { useState } from 'react';
import { getErrorMessage } from '@/utils/error';

export interface OICD_Auth_Context {
    code_verifier: string;
    nonce?: string;
}
interface OICD_Auth_Response {
    ctx: OICD_Auth_Context,
    auth_url: string
}

export function useAuth(initialLoading: string | boolean) {
    const [loading, setLoading] = useState<string | boolean>(initialLoading);
    const [hasError, setError] = useState<string>();

    const getOAuthContext = (provider: string) => () => {
        setLoading(true);
        axios.get<OICD_Auth_Response>(`/api/auth/${provider}`)
            .then(res => {
                const { ctx, auth_url } = res.data;
                // keep context in session storage
                sessionStorage.setItem(`oauth_${provider}`, JSON.stringify(ctx));
                // redirect to auth url
                // replace instead of href to prevent go back
                window.location.replace(auth_url);
            })
            .catch(err => {
                setError(getErrorMessage(err));
            });
    }

    return {
        loading,
        setLoading,
        hasError,
        setError,
        getOAuthContext
    };
}