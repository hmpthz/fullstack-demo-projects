import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, type RouteObject } from 'react-router-dom';
import { LuLoader2 } from 'react-icons/lu';
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
  const { req, file, formData, register, handleSubmit } = useCreateListing();
  const buttonDisabled = (req.loading != false);

  return (
    <main className='p-3 max-w-xl sm:max-w-4xl mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Create a Listing</h1>
      <form className='flex flex-col sm:flex-row gap-4' onSubmit={handleSubmit}>
        <section className='flex-1 sm:max-w-[50%]'>
          <input id='name' type='text' placeholder='Name' minLength={10} maxLength={62} required
            className={`${DesignTwd.input}`} {...register('name')} />
          <input id='description' type='text' placeholder='Description' required
            className={`${DesignTwd.input}`} {...register('description')} />
          <input id='address' type='text' placeholder='Address' required
            className={`${DesignTwd.input}`} {...register('address')} />
          <div className='my-4 flex flex-wrap gap-4'>
            <label>
              <input id='sale' type='radio' value='sale' {...register('listingType', { rerender: true })}
                className='w-5 h-5 mr-2 align-text-bottom' />
              <span>Sale</span>
            </label>
            <label>
              <input id='rent' type='radio' value='rent' {...register('listingType', { rerender: true })}
                className='w-5 h-5 mr-2 align-text-bottom' />
              <span>Rent</span>
            </label>
            <label>
              <input id='parking-spot' type='checkbox' {...register('parking')}
                className='w-5 h-5 mr-2 align-text-bottom' />
              <span>Parking Spot</span>
            </label>
            <label>
              <input id='furnished' type='checkbox' {...register('furnished')}
                className='w-5 h-5 mr-2 align-text-bottom' />
              <span>Furnished</span>
            </label>
            <label>
              <input id='offer' type='checkbox' {...register('offer', { rerender: true })}
                className='w-5 h-5 mr-2 align-text-bottom' />
              <span>Offer</span>
            </label>
          </div>
          <div className='my-2 flex gap-x-5'>
            <span>
              <input id='bedrooms' type='number' min={1} max={10} required
                className='p-2 rounded-lg border' {...register('bedrooms')} />
              <label htmlFor='bedrooms' className='pl-2'>Beds</label>
            </span>
            <span>
              <input id='bathrooms' type='number' min={1} max={10} required
                className='p-2 rounded-lg border' {...register('bathrooms')} />
              <label htmlFor='bathrooms' className='pl-2'>Baths</label>
            </span>
          </div>
          <div className='flex gap-x-5 flex-wrap gap-y-2'>
            <span className='flex items-center'>
              <input id='regular-price' type='number' min={50} required
                className='w-28 p-2 rounded-lg border' {...register('regularPrice')} />
              <label htmlFor='regular-price' className='pl-2 block text-center leading-5'>
                <p>Regular Price</p>
                {formData.listingType == 'rent'
                  && <p className='text-xs'>($ / month)</p>}
              </label>
            </span>
            {formData.offer
              && <span className='flex items-center'>
                <input id='discount-price' type='number' min={0} required
                  className='w-28 p-2 rounded-lg border' {...register('discountedPrice')} />
                <label htmlFor='discount-price' className='pl-2 block text-center leading-5'>
                  <p>Discounted Price</p>
                  {formData.listingType == 'rent'
                    && <p className='text-xs'>($ / month)</p>}
                </label>
              </span>}
          </div>
        </section>
        <section className='flex-1 sm:max-w-[50%]'>
          <p>
            <span className='font-semibold'>Images: </span>
            <span className='text-gray-600'>The first image will be the cover (max 6)</span>
          </p>
          <div className='my-4'>
            <input id='images' type='file' accept='image/*' multiple required disabled={buttonDisabled}
              onChange={file.handleChange} className='p-3 w-full border border-gray-300 rounded' />
          </div>
          <div className='my-4 flex flex-wrap gap-4 justify-center'>
            {file.arr.map((item => <ImageCard key={item.url} {...item} />))}
          </div>
          <SubmitButton loading={req.loading} disabled={buttonDisabled}>
            CREATE LISTING
          </SubmitButton>
          <AlertSection error={req.hasError} success={req.success} />
        </section>
      </form>
    </main>
  );
}

const ImageCard = ({ b, url, state }: LocalFile) => (
  <div className='w-32 p-2 text-sm text-center border border-gray-300 [&:first-child]:border-black rounded-md'>
    <img src={url} className='h-28 w-28 object-contain' />
    <p title={b.name} className='overflow-hidden text-ellipsis'>{b.name}</p>
    {state == 'uploading'
      ? <p className='text-gray-600'>
        <LuLoader2 className='inline align-middle animate-spin mr-1' />
        <span>uploading...</span>
      </p>
      : state == 'success'
        ? <p className='text-green-600 font-bold'>success</p>
        : state == 'error'
          ? <p className='text-red-600 font-bold'>failed</p>
          : <p>&nbsp;</p>}
  </div>
);

export interface Listing {
  _id: string;
  name: string;
  description: string;
  address: string;
  bathrooms: number;
  bedrooms: number;
  furnished: boolean;
  parking: boolean;
  images: StorageObject[];
  listingType: string;
  offer: boolean;
  regularPrice: number;
  discountedPrice: number;
}
type ListingFormData = Omit<Listing, 'images' | '_id'> & { imageFilenames: string[] };
const initForm: Partial<ListingFormData> = {
  furnished: true, parking: true, offer: true,
  listingType: 'rent', discountedPrice: 0
};
// local object url for displaying
type LocalFile = { b: File, url: string, state: UploadState };

function useCreateListing() {
  const userId = useRootStore('user').profile!.id;
  const { formData, register } = useForm(initForm);
  const [files, _setFiles] = useState<LocalFile[]>([]);

  const { loading, error, success } = useRequestStates({ loading: false });
  const navigate = useNavigate();

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
      formData.imageFilenames = newFiles.map(f => f.name);
      return;
    }
    e.target.value = '';
    error.set('Number of images cannot be more than 6.');
    setLocalFiles([]);
    formData.imageFilenames = undefined;
  }

  function setFileUploadState(s: UploadState, i?: number) {
    if (i != undefined) {
      files[i].state = s;
    }
    else {
      files.forEach(f => f.state = s);
    }
    _setFiles([...files]);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (formData.discountedPrice! > formData.regularPrice!) {
      return error.set('Discounted price must be lower than regular price.');
    }

    loading.send('submit');
    try {
      const newListing = (await privateApi.post<Listing>(
        '/api/listing/create', formData
      )).data;

      await supabaseStorage.uploadMany(
        files.map(({ b }) => b), newListing.images, setFileUploadState
      );
      success.receive('Listing created.');
    }
    catch (errMsg) {
      error.receive(errMsg as string);
    }
  }

  return {
    req: {
      loading: loading.val,
      hasError: error.val,
      success: success.val
    },
    file: {
      arr: files,
      handleChange: handleFileChange
    },
    formData,
    register,
    handleSubmit
  }
}