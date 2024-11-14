import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams, type RouteObject } from 'react-router-dom';
import { useAuth, type OICD_Auth_Context } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/error';

export const signinRoute: RouteObject = {
  path: '/sign-in/:provider?',
  element: <SignIn />
}

const supportedProviders = ['google'];

function SignIn() {
  const { provider, loading, hasError, getOAuthContext } = useSignIn();
  const buttonDisabled = (loading != false);

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

interface OICD_Token_Request extends OICD_Auth_Context {
  params: Record<string, string>;
}

function useSignIn() {
  const { provider } = useParams();
  const { loading, setLoading, hasError, setError, getOAuthContext } = useAuth(provider != undefined);

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
        setError(undefined);
        console.log(res.data);
      })
      .catch(err => {
        setError(getErrorMessage(err));
      });
  }, []);

  return {
    provider,
    loading,
    setLoading,
    hasError,
    getOAuthContext
  };
}
