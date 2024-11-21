import { type FormEvent } from 'react';
import { Link, useNavigate, type RouteObject } from 'react-router-dom';
import { useOAuth } from '@/hooks/useOAuth';
import { validator } from '@/utils/validator';
import { useForm } from '@/hooks/useForm';
import { DesignTwd, ErrorSection, OAuthSection, SubmitButton } from '@/components/UI';
import { publicApi } from '@/utils/axios';

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

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input id='username' type='text' placeholder='username' autoComplete='username'
          className={DesignTwd.input} {...register('username')} />
        <input id='email' type='email' placeholder='email' autoComplete='email'
          className={DesignTwd.input} {...register('email')} />
        <input id='password' type='password' placeholder='password' autoComplete='new-password'
          className={DesignTwd.input} {...register('password')} />
        <SubmitButton loading={loading} disabled={buttonDisabled}>
          SIGN UP
        </SubmitButton>
      </form>

      <OAuthSection loading={loading} disabled={buttonDisabled} handle={handleOAuth} />
      <ErrorSection error={hasError} />
    </>
  );
}


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
    publicApi.post('/api/auth/signup', formData)
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