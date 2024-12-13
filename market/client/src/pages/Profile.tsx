import { useRef, useState, type FormEvent } from 'react';
import { Link, type RouteObject } from 'react-router-dom';
import { useRootDispatch, useRootStore } from '@/store/store';
import { DesignTwd, AlertSection, SubmitButton, LoadSpinner } from '@/components/UI';
import { useForm } from '@/hooks/useForm';
import { useRequestStates } from '@/hooks/useRequestStates';
import { supabaseStorage } from '@/utils/supabase';
import { getValidator } from '@/utils/validator';
import type { StorageObject, UserProfile } from '@/store/slice/userSlice';
import { privateApi } from '@/utils/axios';

export const profileRoute: RouteObject = {
  path: '/profile',
  element: <Profile />
}

function Profile() {
  const { file, avatar, req, register, handleSubmit, handleDelete, handleSignOut } = useProfile();
  const buttonDisabled = (req.loading != false);

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
      {file.state && <button type='button' disabled={buttonDisabled} onClick={file.remove}
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
        <SubmitButton loading={req.loading} disabled={buttonDisabled}>
          UPDATE
        </SubmitButton>
      </form>
      <Link to={buttonDisabled ? '#' : '/create-listing'}
        className={`${DesignTwd.button} text-white text-center bg-green-700 hover:bg-green-600`}>
        CREATE NEW LISTING
      </Link>
      <div className='flex justify-between mt-5 text-red-700'>
        <button className='hover:underline' onClick={handleDelete} disabled={buttonDisabled}>
          {req.loading != 'delete' ? 'Delete account' : <LoadSpinner />}
        </button>
        <button className='hover:underline' onClick={handleSignOut} disabled={buttonDisabled}>
          {req.loading != 'signout' ? 'Sign out' : <LoadSpinner />}
        </button>
      </div>
      <AlertSection error={req.hasError} success={req.success} />
    </div>
  );
}

type UpdateFormData = Pick<UserProfile, 'email' | 'username'> & {
  password: string,
  avatarFilename: string
}
const validate = getValidator({ username: true, email: true, password: false });

function useProfile() {
  const { dispatch, userActions } = useRootDispatch();
  const { id: userId, ...profile } = useRootStore('user').profile!;
  const initForm: UpdateFormData = { ...profile, password: '', avatarFilename: '' };
  const { formData, register, setFormValue, stripUnchanged } = useForm(initForm);

  const { loading, error, success } = useRequestStates({ loading: false });
  const [file, setFile] = useState<File>();
  const fileInput = useRef<HTMLInputElement>(null);

  function handleAvatar() {
    fileInput.current?.click();
  }
  function handleFileChange() {
    const newFile = fileInput.current?.files?.[0];
    if (!newFile) return;
    setFile(newFile);
    setFormValue('avatarFilename', newFile.name);
  }
  function removeFile() {
    setFile(undefined);
    setFormValue('avatarFilename', '');
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validated = validate(formData);
    if (validated !== true) {
      error.set(validated); return;
    }
    const [toSend, nChanged] = stripUnchanged();
    if (nChanged == 0) {
      success.set('Nothing\'s changed'); return;
    }

    loading.send('submit');
    try {
      const newProfile = (await privateApi.patch<UserProfile>(
        `/api/user/action/${userId}`, toSend
      )).data;
      if (toSend.avatarFilename && file) {
        await supabaseStorage.uploadDifference(
          file, profile.avatar as StorageObject, newProfile.avatar
        );
        removeFile();
      }

      dispatch(userActions.setProfile(newProfile));
      success.receive('Data update completed.');
    }
    catch (errMsg) {
      error.receive(errMsg as string);
    }
  }

  function handleDelete() {
    loading.send('delete');
    privateApi.delete(`/api/user/action/${userId}`)
      .then(() => {
        dispatch(userActions.clearAll());
      })
      .catch(error.receive);
  }
  function handleSignOut() {
    loading.send('signout');
    privateApi.post(`/api/user/signout`)
      .then(() => {
        dispatch(userActions.clearAll());
      })
      .catch(error.receive);
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
    req: {
      loading: loading.val,
      hasError: error.val,
      success: success.val
    },
    register,
    handleSubmit,
    handleDelete,
    handleSignOut
  };
}