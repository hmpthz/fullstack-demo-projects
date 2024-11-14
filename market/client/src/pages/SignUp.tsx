import axios from 'axios';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, type RouteObject } from 'react-router-dom';
import { LuLoader2 } from "react-icons/lu";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/error';

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

type SignUpFormData = {
  email: string,
  username: string,
  password: string
}

function Form() {
  const { loading, setLoading, hasError, setError, getOAuthContext } = useAuth(false);
  const [formData, setFormData] = useState<SignUpFormData>({ email: '', username: '', password: '' });
  const navigate = useNavigate();

  function hookForm(prop: keyof SignUpFormData) {
    function onChange(e: ChangeEvent<HTMLInputElement>) {
      setFormData({ ...formData, [prop]: e.target.value });
    }
    return {
      onChange,
      value: formData[prop]
    };
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!(/^\S+@\S+\.\S+$/).test(formData.email)) {
      setError('Not a valid email'); return;
    }
    else if (formData.username.length < 3) {
      setError('Username should be at least 3 characters'); return;
    }
    else if (formData.password.length < 4) {
      setError('Password should be at least 4 characters'); return;
    }

    setLoading('submit');
    axios.post('/api/auth/signup', formData)
      .then(() => {
        setLoading(false);
        setError(undefined);
        navigate('/sign-in');
      })
      .catch(err => {
        setLoading(false);
        setError(getErrorMessage(err));
      });
  }

  const buttonDisabled = (loading != false);
  const inputTwd = 'block my-4 p-3 rounded-lg w-full';

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input id='username' type='text' placeholder='username'
          className={`${inputTwd} border`} {...hookForm('username')} />
        <input id='email' type='email' placeholder='email'
          className={`${inputTwd} border`} {...hookForm('email')} />
        <input id='password' type='password' placeholder='password'
          className={`${inputTwd} border`} {...hookForm('password')} />
        <button type='submit' disabled={buttonDisabled} className={`${inputTwd} text-white bg-slate-700 hover:bg-slate-600 disabled:bg-slate-500`}>
          {loading == 'submit'
            ? <Loading />
            : 'SIGN UP'}
        </button>
      </form>

      <div className='-my-1 flex items-center'>
        <span className='bg-gray-300 h-0.5 w-full' />
        <span className='mx-4'>or</span>
        <span className='bg-gray-300 h-0.5 w-full' />
      </div>
      <button type='button' disabled={buttonDisabled} className={`${inputTwd} text-white bg-slate-700 hover:bg-slate-600 disabled:bg-slate-500`}>
        {loading == 'google'
          ? <Loading />
          : <p className='flex justify-center items-center gap-3'>
            <FaGoogle className='w-5 h-5' />
            <span>SIGN UP WITH GOOGLE</span>
          </p>}
      </button>

      {hasError &&
        <p className={`${inputTwd} border-2 border-red-600 bg-red-200/80 text-red-800`}>
          {hasError}
        </p>}
    </>
  );
}

const Loading = () => (
  <p className='flex justify-center items-center gap-2'>
    <LuLoader2 className='w-5 h-5 animate-spin' />
    <span>Loading...</span>
  </p>
)