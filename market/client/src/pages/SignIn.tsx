import { getErrorMessage } from '@/utils/error';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams, type RouteObject } from 'react-router-dom';

export const signinRoute: RouteObject = {
  path: '/sign-in/:provider?',
  element: <SignIn />
}

const supportedProviders = ['google'];

function SignIn() {
  const { provider, isLoading, hasError, getOAuthContext } = useSignIn();
  const buttonDisabled = isLoading || (hasError != undefined);

  return (
    <>
      <div>SignIn</div>
      <button className='p-2 border border-black'
        disabled={buttonDisabled} onClick={getOAuthContext('google')}>
        Connect to Google
      </button>
      {hasError && <div className='bg-red-400 border border-red-600'>
        {hasError}
      </div>}
    </>
  );
}

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

function useSignIn() {
  const { provider } = useParams();
  const [isLoading, setLoading] = useState(provider != undefined);
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

  useEffect(() => {
    // main sign in page
    if (!provider) {
      return;
    }
    if (!supportedProviders.includes(provider)) {
      setError(`Unsupported provider: ${provider}`);
      return;
    }
    // oauth redirect page, ask for id token
    // recover session context
    const ctx = sessionStorage.getItem(`oauth_${provider}`);
    if (!ctx) {
      setError(`Auth context missing`);
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
      .then(res => {
        console.log(res.data);
      })
      .catch(err => {
        setError(getErrorMessage(err));
      });
  }, []);

  return {
    provider,
    isLoading,
    hasError,
    getOAuthContext
  };
}
