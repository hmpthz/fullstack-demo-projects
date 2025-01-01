import { useRef, useState, type FormEvent } from 'react';
import { Link, type RouteObject } from 'react-router-dom';
import { useRootDispatch, useRootStore } from '@/store/store';
import { DesignTwd, AlertSection, SubmitButton, LoadingButton } from '@/components/UI';
import { useForm } from '@/hooks/useForm';
import { useRequestStates } from '@/hooks/useRequestStates';
import { supabaseStorage } from '@/utils/supabase';
import { getValidator } from '@/utils/validator';
import type { StorageObject, UserProfile } from '@/store/slice/userSlice';
import { privateApi, publicApi } from '@/utils/axios';
import type { Listing } from './CreateListing';

export const profileRoute: RouteObject = {
  path: '/profile',
  element: <Profile />
}

function Profile() {
  const { file, avatar, listing, req, register, handleSubmit, handleDelete, handleSignOut } = useProfile();
  const buttonDisabled = (req.loading != false);

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form className='' onSubmit={handleSubmit}>
        <Avatar file={file} avatar={avatar} disabled={buttonDisabled} />
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
        <LoadingButton cond={req.loading != 'delete'}
          className='hover:underline' onClick={handleDelete} disabled={buttonDisabled}>
          Delete account
        </LoadingButton>
        <LoadingButton cond={req.loading != 'signout'}
          className='hover:underline' onClick={handleSignOut} disabled={buttonDisabled}>
          Sign out
        </LoadingButton>
      </div>
      <AlertSection error={req.hasError} success={req.success} />
      <LoadingButton cond={req.loading != 'listing'} onClick={listing.get} disabled={buttonDisabled}
        className='my-2 w-full text-green-600 hover:underline'>
        Show Listings
      </LoadingButton>
      <div>
        {listing.arr.map(item =>
          <ListingCard key={item._id} {...item} disabled={buttonDisabled} loading={req.loading} />)}
      </div>
    </div>
  );
}

type DisableProp = {
  disabled: boolean;
}
type AvatarProps = Pick<ReturnType<typeof useProfile>, 'file' | 'avatar'> & DisableProp;

const Avatar = ({ file, avatar, disabled }: AvatarProps) => (
  <>
    <input type='file' className='hidden' ref={file.ref} accept='image/*' onChange={file.handleChange} />
    <button type='button' onClick={avatar.handleClick} disabled={disabled}
      className='block group w-24 h-24 my-4 mx-auto rounded-full overflow-hidden relative'>
      <img src={avatar.publicURL} alt='avatar' className='w-full h-full object-cover' />
      <div className='w-full h-full -translate-y-full bg-black/50 opacity-0 group-hover:opacity-100 text-white text-lg transition-opacity flex items-center justify-center'>
        Edit
      </div>
    </button>
    {file.state && <button type='button' disabled={disabled} onClick={file.remove}
      className='w-full text-center text-green-600 hover:text-red-500 hover:after:content-["_❌"] break-words'>
      {file.state.name}
    </button>}
  </>
);

interface BriefListing extends Pick<Listing, '_id' | 'name' | 'images'>, DisableProp {
  loading: string | boolean;
}
const ListingCard = ({ name, images, disabled, loading }: BriefListing) => (
  <div className='my-2 p-2 flex items-center gap-2 border rounded-lg'>
    <img src={images[0].publicURL} className='w-24 h-20 object-contain' />
    <p className='flex-1 text-lg font-bold'>{name}</p>
    <div className='flex flex-col items-center'>
      <LoadingButton cond={loading != 'delete-listing'} disabled={disabled}
        className='text-green-600 hover:underline'>
        DELETE
      </LoadingButton>
      <p>EDIT</p>
    </div>
  </div>
)

type UpdateFormData = Pick<UserProfile, 'email' | 'username'> & {
  password: string,
  avatarFilename: string
}
const validate = getValidator({ username: true, email: true, password: false });

function useProfile() {
  const { dispatch, userActions } = useRootDispatch();
  const { id: userId, ...profile } = useRootStore('user').profile!;
  const initForm: UpdateFormData = { ...profile, password: '', avatarFilename: '' };
  const { formData, register, stripUnchanged } = useForm(initForm);

  const { loading, error, success } = useRequestStates({ loading: false });
  const [file, setFile] = useState<File>();
  const fileInput = useRef<HTMLInputElement>(null);
  const [listings, setListings] = useState<BriefListing[]>([]);

  function handleAvatar() {
    fileInput.current?.click();
  }
  function handleFileChange() {
    const newFile = fileInput.current?.files?.[0];
    if (!newFile) return;
    setFile(newFile);
    formData.avatarFilename = newFile.name;
  }
  function removeFile() {
    setFile(undefined);
    formData.avatarFilename = '';
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validated = validate(formData);
    if (validated !== true) {
      return error.set(validated);
    }
    const [toSend, nChanged] = stripUnchanged();
    if (nChanged == 0) {
      return success.set('Nothing\'s changed');
    }

    loading.send('submit');
    try {
      const newProfile = (await privateApi.patch<UserProfile>(
        `/api/user/action/${userId}`, toSend
      )).data;
      if (toSend.avatarFilename && file) {
        await supabaseStorage.uploadDifference(
          file, newProfile.avatar as StorageObject, profile.avatar
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

  async function getListings() {
    loading.send('listing');
    try {
      const listings = (await publicApi.get<BriefListing[]>(
        `/api/listing/user/${userId}`
      )).data;
      setListings(listings);
      success.receive();
    }
    catch (errMsg) {
      error.receive(errMsg as string);
    }
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
    listing: {
      get: getListings,
      arr: listings
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