import { useRef, useState, type FormEvent } from 'react';
import { type RouteObject } from 'react-router-dom';
import { useRootDispatch, useRootStore } from '@/store/store';
import { DesignTwd, AlertSection, SubmitButton } from '@/components/UI';
import { useForm } from '@/hooks/useForm';
import { useRequestStates } from '@/hooks/useRequestStates';
import { supabaseStorage } from '@/utils/supabase';
import { getValidator } from '@/utils/validator';
import type { UserProfile } from '@/store/slice/userSlice';
import { privateApi } from '@/utils/axios';

export const profileRoute: RouteObject = {
  path: '/profile',
  element: <Profile />
}

function Profile() {
  const { file, avatar, loading, hasError, success, register, handleSubmit } = useProfile();
  const buttonDisabled = (loading != false);

  const Avatar = () => (
    <>
      <input type='file' className='hidden' ref={file.ref} accept='image/*' onChange={file.handleChange} />
      <button type='button' onClick={avatar.handleClick} disabled={buttonDisabled}
        className='block group w-24 h-24 my-4 mx-auto rounded-full overflow-hidden relative'>
        <img src={avatar.publicURL} alt='avatar' className='w-full h-full object-cover' />
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
      <div className='flex justify-between mt-5 text-red-700'>
        <button className='hover:underline'>Delete account</button>
        <button className='hover:underline'>Sign Out</button>
      </div>
      <AlertSection error={hasError} success={success} />
    </div>
  );
}

type UpdateFormData = Omit<UserProfile, 'id'> & {
  password: string
}
const validate = getValidator({ username: true, email: true, password: false });

function useProfile() {
  const { dispatch, userActions } = useRootDispatch();
  const { id: userId, ...profile } = useRootStore('user').profile!;
  const initForm: UpdateFormData = { ...profile, password: '' };
  const { formData, register, setFormValue, stripUnchanged } = useForm(initForm);

  const { loading, setLoading, hasError, setError, success, setSuccess, onSend } = useRequestStates({ loading: false });
  const [file, setFile] = useState<File>();
  const fileInput = useRef<HTMLInputElement>(null);

  function handleAvatar() {
    fileInput.current?.click();
  }
  function handleFileChange() {
    const newFile = fileInput.current?.files?.[0];
    if (!newFile) return;
    setFile(newFile);
    setFormValue('avatar', supabaseStorage.getAvatarURL(newFile, userId));
  }
  function removeFile() {
    setFile(undefined);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validated = validate(formData);
    if (validated !== true) {
      setError(validated); return;
    }
    const [toSend, nChanged] = stripUnchanged();
    if (nChanged == 0) {
      setSuccess('Nothing\'s changed'); return;
    }

    onSend('submit');
    const tasks: Promise<boolean | object>[] = [
      privateApi.post(`/api/user/update/${userId}`, toSend)
        .then(res => res.data) // return profile data
        .catch(errMsg => errMsg)
    ];

    if (file) {
      tasks.push(supabaseStorage.uploadAvatar(file, formData.avatar, profile.avatar)
        .then(err => {
          if (err == null) {
            setFile(undefined); return true;
          }
          setError(err); return false;
        }));
    }

    Promise.all(tasks).then(results => {
      if (results.every(success => success)) {
        setSuccess('Data update completed.');
        dispatch(userActions.setProfile(results[0] as UserProfile));
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
      ...profile.avatar,
      handleClick: handleAvatar
    },
    loading,
    hasError,
    success,
    register,
    handleSubmit
  };
}