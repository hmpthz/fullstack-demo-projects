import { useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams, type RouteObject } from 'react-router-dom';
import { useOAuth } from '@/hooks/useOAuth';
import { getValidator } from '@/utils/validator';
import { useForm } from '@/hooks/useForm';
import { DesignTwd, AlertSection, OAuthSection, SubmitButton } from '@/components/UI';
import { publicApi } from '@/utils/axios';
import { useRootDispatch } from '@/store/store';

export const signinRoute: RouteObject = {
  path: '/sign-in/:provider?',
  element: <SignIn />
}

function SignIn() {
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='my-7 text-3xl text-center font-semibold'>Sign In</h1>
      <Form />
      <div className='mt-5'>
        <span>Don&rsquo;t have an account?</span>
        <Link to='/sign-up' className='ml-2 text-blue-700 hover:underline'>Sign Up</Link>
      </div>
    </div>
  );
}

function Form() {
  const { provider } = useParams();
  const { loading, hasError, success, register, handleSubmit, handleOAuth } = useSignIn(provider);
  const buttonDisabled = (loading != false);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input id='email' type='email' placeholder='email' autoComplete='email'
          className={DesignTwd.input} {...register('email')} />
        <input id='password' type='password' placeholder='password' autoComplete='current-password'
          className={DesignTwd.input} {...register('password')} />
        <SubmitButton loading={loading} disabled={buttonDisabled}>
          SIGN IN
        </SubmitButton>
      </form>

      <OAuthSection loading={loading} disabled={buttonDisabled} handle={handleOAuth} />
      <AlertSection error={hasError} success={success} />
    </>
  );
}


type SignInFormData = {
  email: string,
  password: string
}
const validate = getValidator({ email: true });

function useSignIn(provider: string | undefined) {
  const [query] = useSearchParams();
  const { loading, error, success, handleOAuthContext, handleOAuthRedirect } = useOAuth({
    loading: provider != undefined, error: query.get('error') ?? undefined, success: query.get('success') ?? undefined
  });
  const { formData, register } = useForm<SignInFormData>({ email: '', password: '' });
  const navigate = useNavigate();
  const { dispatch, userActions } = useRootDispatch();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validated = validate(formData);
    if (validated !== true) {
      return error.set(validated);
    }

    loading.send('submit');
    publicApi.post('/api/auth/signin', formData)
      .then(res => handleSignInSuccess(res.data))
      .catch(error.receive);
  }

  // eslint-disable-next-line
  function handleSignInSuccess(data: any) {
    success.receive();
    dispatch(userActions.setTokenRefresh(data));
    navigate('/');
    console.log(data);
  }

  useEffect(() => {
    handleOAuthRedirect(provider, handleSignInSuccess);
  }, []);

  return {
    loading: loading.val,
    hasError: error.val,
    success: success.val,
    register,
    handleSubmit,
    handleOAuth: handleOAuthContext
  };
}