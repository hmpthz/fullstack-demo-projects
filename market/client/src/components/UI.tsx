import type React from "react";
import { FaGoogle } from "react-icons/fa";
import { LuLoader2 } from "react-icons/lu";

export const DesignTwd = {
  shared: 'my-4 p-3 rounded-lg',
  input: 'block my-4 p-3 rounded-lg w-full border',
  button: 'block my-4 p-3 rounded-lg w-full'
};

interface LoadingButtonProps extends React.ComponentProps<'button'> {
  cond: boolean;
}
export const LoadingButton = ({ cond, children, className, ...props }: LoadingButtonProps) => (
  <button className={`${className} ${DesignTwd.button}`} {...props}>
    {cond ? children : <LoadSpinner />}
  </button>
);

export const LoadSpinner = () => (
  <p className='flex justify-center items-center gap-2'>
    <LuLoader2 className='w-5 h-5 animate-spin' />
    <span>Loading...</span>
  </p>
);

interface SubmitButtonProps {
  loading: string | boolean;
  disabled: boolean;
}
export const SubmitButton = ({ loading, disabled, children }: SubmitButtonProps & ChildrenProps) => (
  <LoadingButton type='submit' cond={loading != 'submit'} disabled={disabled}
    className='text-white bg-slate-700 hover:bg-slate-600 disabled:bg-slate-500'>
    {children}
  </LoadingButton>
);

interface ErrorProps {
  error: string | undefined;
}
export const ErrorSection = ({ error }: ErrorProps) => (
  error
    ? <p className={`${DesignTwd.button} border-2 border-red-600 bg-red-200/80 text-red-800`}>
      {error}
    </p>
    : null
);

interface OAuthProps extends SubmitButtonProps {
  handle: (provider: string) => () => void;
}
export const OAuthSection = ({ loading, disabled, handle }: OAuthProps) => (
  <div>
    <div className='-my-1 flex items-center'>
      <span className='bg-gray-300 h-0.5 w-full' />
      <span className='mx-4'>or</span>
      <span className='bg-gray-300 h-0.5 w-full' />
    </div>
    <LoadingButton type='button' cond={loading != 'google'} disabled={disabled} onClick={handle('google')}
      className='text-white bg-red-700 hover:bg-red-700/80 disabled:bg-red-700/80'>
      <p className='flex justify-center items-center gap-3'>
        <FaGoogle className='w-5 h-5' />
        <span>CONTINUE WITH GOOGLE</span>
      </p>
    </LoadingButton>
  </div>
);
