import axios from 'axios';
import { getErrorMessage } from '@/utils/error';
import { useRequestStates } from './useRequestStates';

interface OICD_Auth_Context {
  code_verifier: string;
  nonce?: string;
}
interface OICD_Auth_Response {
  ctx: OICD_Auth_Context,
  auth_url: string
}
interface OICD_Token_Request extends OICD_Auth_Context {
  params: Record<string, string>;
}

export const supportedProviders = ['google'];

export function useOAuth(initialLoading: boolean) {
  const req = useRequestStates(initialLoading);

  const handleOAuthContext = (provider: string) => () => {
    req.setLoading(provider);
    req.setError(undefined);
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
        req.setError(getErrorMessage(err));
      });
  }

  const handleOAuthRedirect = (
    provider: string | undefined,
    // eslint-disable-next-line
    handleSuccess: (data: any) => void
  ) => {
    // main sign in page
    if (!provider) {
      return;
    }
    if (!supportedProviders.includes(provider)) {
      req.setError(`Unsupported provider: ${provider}`);
      return;
    }
    // oauth redirect page, ask for id token
    // recover session context
    const ctx = sessionStorage.getItem(`oauth_${provider}`);
    if (!ctx) {
      req.setError(`Auth context missing`);
      return;
    }
    // redirect page has params for auth
    const params: Record<string, string> = {};
    (new URLSearchParams(window.location.search)).forEach((val, key) => params[key] = val);
    const toSend: OICD_Token_Request = {
      ...(JSON.parse(ctx) as OICD_Auth_Context),
      params
    };
    // send to server
    axios.post(`/api/auth/${provider}/callback`, toSend)
      .then(res => handleSuccess(res.data))
      .catch(err => {
        req.setError(getErrorMessage(err));
      });
  }

  return {
    req,
    handleOAuthContext,
    handleOAuthRedirect
  };
}