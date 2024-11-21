import { useRef, useState, type FormEvent } from 'react';
import { type RouteObject } from 'react-router-dom';
import { useRootStore } from '@/store/store';
import { DesignTwd, ErrorSection, SubmitButton } from '@/components/UI';
import { useForm } from '@/hooks/useForm';
import { useRequestStates } from '@/hooks/useRequestStates';
import { supabaseStorage } from '@/utils/supabase';
import { validator } from '@/utils/validator';
import { getErrorMessage } from '@/utils/error';

export const profileRoute: RouteObject = {
  path: '/profile',
  element: <Profile />
}

function Profile() {
  const { file, avatar, loading, hasError, register, handleSubmit } = useProfile();
  const buttonDisabled = (loading != false);

  const Avatar = () => (
    <>
      <input type='file' className='hidden' ref={file.ref} accept='image/*' onChange={file.handleChange} />
      <button type='button' onClick={avatar.handleClick} className='block group w-24 h-24 my-4 mx-auto rounded-full overflow-hidden relative'>
        <img src={avatar.url} alt='avatar' className='w-full h-full object-cover' />
        <div className='w-full h-full -translate-y-full bg-black/50 opacity-0 group-hover:opacity-100 text-white text-lg transition-opacity flex items-center justify-center'>
          Edit
        </div>
      </button>
      {file.state && <button type='button' onClick={file.remove}
        className='w-full text-center text-green-600 hover:text-red-500 hover:after:content-["_❌"] break-words'>
        {file.state.name}
      </button>}
    </>
  );

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form className='' onSubmit={handleSubmit}>
        <Avatar />
        <input id='username' type='text' placeholder='username' autoComplete='username'
          className={DesignTwd.input} {...register('username')} />
        <input id='email' type='email' placeholder='email' autoComplete='email'
          className={DesignTwd.input} {...register('email')} />
        <input id='password' type='password' placeholder='password' autoComplete='new-password'
          className={DesignTwd.input} {...register('password')} />
        <SubmitButton loading={loading} disabled={buttonDisabled}>
          UPDATE
        </SubmitButton>
      </form>
      <ErrorSection error={hasError} />
      <div className='flex justify-between mt-5 text-red-700'>
        <button className='hover:underline'>Delete account</button>
        <button className='hover:underline'>Sign Out</button>
      </div>
    </div>
  );
}

type UpdateFormData = {
  email: string,
  username: string,
  password: string
}

function useProfile() {
  const { profile } = useRootStore('user');
  const { loading, setLoading, hasError, setError, onSend } = useRequestStates(false);
  const initForm: UpdateFormData = { email: profile!.email, username: profile!.username, password: '' };
  const { formData, register } = useForm(initForm);
  const [file, setFile] = useState<File>();
  const fileInput = useRef<HTMLInputElement>(null);

  function handleAvatar() {
    fileInput.current?.click();
  }
  function handleFileChange() {
    const newFile = fileInput.current?.files?.[0];
    if (!newFile) return;
    setFile(newFile);
  }
  function removeFile() {
    setFile(undefined);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validator.username(formData)) {
      setError(validator.errors.username); return;
    }
    else if (!validator.email(formData)) {
      setError(validator.errors.email); return;
    }
    else if (formData.password != initForm.password && !validator.password(formData)) {
      setError(validator.errors.password); return;
    }

    onSend('submit');
    const tasks: Promise<boolean>[] = [];

    if (file) {
      tasks.push(supabaseStorage.uploadAvatar(file)
        .then(({data, error}) => {
          if (data) {
            return true;
          }
          setError(getErrorMessage(error));
          return false;
        }));
    }

    const toUpdate = {...formData};
    for (const prop of (Object.keys(initForm) as (keyof UpdateFormData)[])) {
      if (toUpdate[prop] == initForm[prop]) {
        delete toUpdate[prop];
      }
    }
    if (Object.keys(toUpdate).length > 0) {

    }

    Promise.all(tasks).then(results => {
      if (results.every(success => success)) {
        setError(undefined);
      }
      setLoading(false);
    });
  }

  return {
    file: {
      ref: fileInput,
      state: file,
      handleChange: handleFileChange,
      remove: removeFile
    },
    avatar: {
      url: profile!.avatar,
      handleClick: handleAvatar
    },
    loading,
    hasError,
    register,
    handleSubmit
  };
}