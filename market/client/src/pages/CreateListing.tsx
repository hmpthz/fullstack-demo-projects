import { useState, type ChangeEvent, type FormEvent } from 'react';
import { type RouteObject } from 'react-router-dom';
import { AlertSection, DesignTwd, SubmitButton } from '@/components/UI';
import { useRequestStates } from '@/hooks/useRequestStates';
import { useRootStore } from '@/store/store';
import type { StorageObject } from '@/store/slice/userSlice';
import { useForm } from '@/hooks/useForm';
import { privateApi } from '@/utils/axios';
import { supabaseStorage, type UploadState } from '@/utils/supabase';

export const createListingRoute: RouteObject = {
  path: '/create-listing',
  element: <CreateListing />
}

function CreateListing() {
  const { req, file, handleSubmit } = useCreateListing();
  const buttonDisabled = (req.loading != false);

  return (
    <main className='p-3 max-w-xl sm:max-w-4xl mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Create a Listing</h1>
      <form className='flex flex-col sm:flex-row gap-4' onSubmit={handleSubmit}>
        <div className='flex-1'>
          <input id='name' type='text' placeholder='Name' minLength={10} maxLength={62} required
            className={`${DesignTwd.input}`} />
          <input id='description' type='text' placeholder='Description' required
            className={`${DesignTwd.input}`} />
          <input id='address' type='text' placeholder='Address' required
            className={`${DesignTwd.input}`} />
          <div className='my-4 flex flex-wrap gap-4'>
            {checkbox('sale', 'Sale')}
            {checkbox('rent', 'Rent')}
            {checkbox('parking-spot', 'Parking Spot')}
            {checkbox('furnished', 'Furnished')}
            {checkbox('offer', 'Offer')}
          </div>
          <div className='my-2 flex gap-x-5'>
            <span>
              <input id='bedrooms' type='number' min={1} max={10} required
                className='p-2 rounded-lg border' />
              <label htmlFor='bedrooms' className='pl-2'>Beds</label>
            </span>
            <span>
              <input id='bathrooms' type='number' min={1} max={10} required
                className='p-2 rounded-lg border' />
              <label htmlFor='bathrooms' className='pl-2'>Baths</label>
            </span>
          </div>
          <div className='flex gap-x-5 flex-wrap gap-y-2'>
            <span className='flex items-center'>
              <input id='regular-price' type='number' min={1} max={10} required
                className='w-28 p-2 rounded-lg border' />
              <label htmlFor='regular-price' className='pl-2 block text-center leading-5'>
                <p>Regular Price</p>
                <p className='text-xs'>($ / month)</p>
              </label>
            </span>
            <span className='flex items-center'>
              <input id='discount-price' type='number' min={1} max={10} required
                className='w-28 p-2 rounded-lg border' />
              <label htmlFor='discount-price' className='pl-2 block text-center leading-5'>
                <p>Discounted Price</p>
                <p className='text-xs'>($ / month)</p>
              </label>
            </span>
          </div>
        </div>
        <div className='flex-1'>
          <p>
            <span className='font-semibold'>Images: </span>
            <span className='text-gray-600'>The first image will be the cover (max 6)</span>
          </p>
          <div className='my-4'>
            <input id='images' type='file' accept='image/*' multiple required
              onChange={file.handleChange} className='p-3 w-full border border-gray-300 rounded' />
          </div>
          <SubmitButton loading={req.loading} disabled={buttonDisabled}>
            CREATE LISTING
          </SubmitButton>
          <AlertSection error={req.hasError} />
        </div>
      </form>
    </main>
  );
}

const checkbox = (id: string, text: string) => (
  <span>
    <input id={id} type='checkbox'
      className='w-5 h-5 align-text-bottom' />
    <label htmlFor={id} className='pl-2'>{text}</label>
  </span>
)

interface Listing {
  name: string;
  description: string;
  address: string;
  bathrooms: number;
  bedrooms: number;
  furnished: boolean;
  parking: boolean;
  images: StorageObject[];
  state: string;
  offer: boolean;
  regularPrice: number;
  discountedPrice: number;
}
type ListingFormData = Omit<Listing, 'images'> & { imageFilenames: string[] };
const initForm: Partial<ListingFormData> = { furnished: false, parking: false, offer: false };
// local object url for displaying
type LocalFile = { b: File, url: string, state: UploadState };

function useCreateListing() {
  const userId = useRootStore('user').profile!.id;
  const { formData, register, setFormValue } = useForm(initForm);

  const { loading, error, success } = useRequestStates({ loading: false });
  const [files, _setFiles] = useState<LocalFile[]>([]);

  function setLocalFiles(files: File[]) {
    _setFiles(prevFiles => {
      prevFiles.forEach(({ url }) => URL.revokeObjectURL(url));
      return files.map(b => ({ b, url: URL.createObjectURL(b), state: 'none' }));
    });
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const newFiles = [...e.target.files];
    if (newFiles.length <= 6) {
      error.set();
      setLocalFiles(newFiles);
      setFormValue('imageFilenames', newFiles.map(f => f.name));
      return;
    }
    e.target.value = '';
    error.set('Number of images shouldn\'t be more than 6.');
    setLocalFiles([]);
    setFormValue('imageFilenames', undefined);
  }

  function setFileUploadState(s: UploadState, i?: number) {

  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    loading.send('submit');
    try {
      const newListing = (await privateApi.post<Listing>(
        '/api/listing/create', formData
      )).data;

      await supabaseStorage.uploadMany(
        files.map(({ b }) => b), newListing.images, setFileUploadState
      );
    }
    catch (errMsg) {
      error.receive(errMsg as string);
    }
    success.receive('Listing created.');
  }

  return {
    req: {
      loading: loading.val,
      hasError: error.val
    },
    file: {
      arr: files,
      handleChange: handleFileChange
    },
    handleSubmit
  }
}