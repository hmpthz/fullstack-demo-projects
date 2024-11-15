import axios from 'axios';
import { type FormEvent } from 'react';
import { Link, useNavigate, type RouteObject } from 'react-router-dom';
import { LuLoader2 } from "react-icons/lu";
import { FaGoogle } from "react-icons/fa";
import { useOAuth } from '@/hooks/useOAuth';
import { validator } from '@/utils/validator';
import { useForm } from '@/hooks/useForm';

export const signupRoute: RouteObject = {
  path: '/sign-up',
  element: <SignUp />
}

function SignUp() {
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='my-7 text-3xl text-center font-semibold'>Sign Up</h1>
      <Form />
      <div className='mt-5'>
        <span>Have an account?</span>
        <Link to='/sign-in' className='ml-2 text-blue-700 hover:underline'>Sign In</Link>
      </div>
    </div>
  );
}

function Form() {
  const { loading, hasError, register, handleSubmit, handleOAuth } = useSignUp();
  const buttonDisabled = (loading != false);
  const inputTwd = 'block my-4 p-3 rounded-lg w-full';

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input id='username' type='text' placeholder='username'
          className={`${inputTwd} border`} {...register('username')} />
        <input id='email' type='email' placeholder='email'
          className={`${inputTwd} border`} {...register('email')} />
        <input id='password' type='password' placeholder='password'
          className={`${inputTwd} border`} {...register('password')} />
        <button type='submit' disabled={buttonDisabled} className={`${inputTwd} text-white bg-slate-700 hover:bg-slate-600 disabled:bg-slate-500`}>
          {loading != 'submit' ? 'SIGN UP' : <LoadingContent />}
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


type SignUpFormData = {
  email: string,
  username: string,
  password: string
}

function useSignUp() {
  const { req, handleOAuthContext } = useOAuth(false);
  const { formData, register } = useForm<SignUpFormData>({ email: '', username: '', password: '' });
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validator.username(formData)) {
      req.setError(validator.errors.username); return;
    }
    else if (!validator.email(formData)) {
      req.setError(validator.errors.email); return;
    }
    else if (!validator.password(formData)) {
      req.setError(validator.errors.password); return;
    }

    req.onSend('submit');
    axios.post('/api/auth/signup', formData)
      .then(handleSignUpSuccess)
      .catch(req.onError);
  }

  function handleSignUpSuccess() {
    req.onSuccess();
    navigate('/sign-in');
  }

  return {
    loading: req.loading,
    hasError: req.hasError,
    register,
    handleSubmit,
    handleOAuth: handleOAuthContext
  }
}