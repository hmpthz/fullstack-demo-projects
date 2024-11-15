import axios from 'axios';
import { useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useParams, type RouteObject } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { LuLoader2 } from 'react-icons/lu';
import { useOAuth } from '@/hooks/useOAuth';
import { useUserDispatch, type UserProfile } from '@/store/slice/userSlice';
import { validator } from '@/utils/validator';
import { useForm } from '@/hooks/useForm';

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
  const { loading, hasError, register, handleSubmit, handleOAuth } = useSignIn(provider);
  const buttonDisabled = (loading != false);
  const inputTwd = 'block my-4 p-3 rounded-lg w-full';

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input id='email' type='email' placeholder='email'
          className={`${inputTwd} border`} {...register('email')} />
        <input id='password' type='password' placeholder='password'
          className={`${inputTwd} border`} {...register('password')} />
        <button type='submit' disabled={buttonDisabled} className={`${inputTwd} text-white bg-slate-700 hover:bg-slate-600 disabled:bg-slate-500`}>
          {loading != 'submit' ? 'SIGN IN' : <LoadingContent />}
        </button>
      </form>

      <div className='-my-1 flex items-center'>
        <span className='bg-gray-300 h-0.5 w-full' />
        <span className='mx-4'>or</span>
        <span className='bg-gray-300 h-0.5 w-full' />
      </div>
      <button type='button' disabled={buttonDisabled} onClick={handleOAuth('google')}
        className={`${inputTwd} text-white bg-red-700 hover:bg-red-700/80 disabled:bg-red-700/80`}>
        {loading != 'google' ? <GoogleButtonContent /> : <LoadingContent />}
      </button>

      {hasError &&
        <p className={`${inputTwd} border-2 border-red-600 bg-red-200/80 text-red-800`}>
          {hasError}
        </p>}
    </>
  );
}

const GoogleButtonContent = () => (
  <p className='flex justify-center items-center gap-3'>
    <FaGoogle className='w-5 h-5' />
    <span>CONTINUE WITH GOOGLE</span>
  </p>
);

const LoadingContent = () => (
  <p className='flex justify-center items-center gap-2'>
    <LuLoader2 className='w-5 h-5 animate-spin' />
    <span>Loading...</span>
  </p>
);


type SignInFormData = {
  email: string,
  password: string
}
interface TokenRefresh_Response {
  accessToken: string;
  expiredAt: number;
  profile: UserProfile;
}

function useSignIn(provider: string | undefined) {
  const { req, handleOAuthContext, handleOAuthRedirect } = useOAuth(provider != undefined);
  const { formData, register } = useForm<SignInFormData>({ email: '', password: '' });
  const navigate = useNavigate();
  const { dispatch, userActions } = useUserDispatch();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validator.email(formData)) {
      req.setError(validator.errors.email); return;
    }

    req.onSend('submit');
    axios.post<TokenRefresh_Response>('/api/auth/signin', formData)
      .then(res => handleSignInSuccess(res.data))
      .catch(req.onError);
  }

  function handleSignInSuccess(data: TokenRefresh_Response) {
    req.onSuccess();
    dispatch(userActions.setUserProfile(data.profile));
    navigate('/');
    console.log(data);
  }

  useEffect(() => {
    handleOAuthRedirect(provider, handleSignInSuccess);
  }, []);

  return {
    loading: req.loading,
    hasError: req.hasError,
    register,
    handleSubmit,
    handleOAuth: handleOAuthContext
  };
}