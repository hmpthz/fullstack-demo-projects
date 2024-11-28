import { StorageClient } from '@hmpthz/supabase-storage-js';
import { getRootStore } from '@/store/store';
import { privateApi } from './axios';
import type { StorageObject, UserToken } from '@/store/slice/userSlice';
import { getErrorMessage, joinErrors } from './error';

class SupabaseStorage extends StorageClient {
    protected _store = getRootStore();
    protected _authenticating?: Promise<string>;

    constructor() {
        super(`https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1`, {});
    }

    getAvatarURL(file: File, userId: string): StorageObject {
        const extname = file.name.slice(file.name.lastIndexOf('.'));
        const storageURL = `avatar/${userId}${extname}`;
        // pretend we're hashing the file
        const hashtag = Math.random().toString(36).slice(2);
        // add a hashtag url param so that browser can refetch image even if url is unchanged
        const publicURL = `${this.url}/object/public/estate-market/${storageURL}?hashtag=${hashtag}`;
        return { storageURL, publicURL };
    }

    async uploadAvatar(file: File, newObj: StorageObject, oldObj: StorageObject) {
        try {
            await this._setAuthHeader();
            const tasks: Promise<string | null>[] = [];

            tasks.push(this.from('estate-market')
                .upload(newObj.storageURL!, file, { cacheControl: '86400', upsert: true })
                .then(({ error }) => error != null ? getErrorMessage(error) : null)
            );
            if (newObj.storageURL != oldObj.storageURL) {
                tasks.push(this.from('estate-market')
                    .remove([newObj.storageURL!])
                    .then(({ error }) => error != null ? getErrorMessage(error) : null));
            }
            return Promise.all(tasks).then(joinErrors);
        }
        catch (err) {
            return getErrorMessage(err);
        }
    }

    protected async _setAuthHeader() {
        const supabase = this._store.getState().user.supabase;
        let accessToken: string;
        if (!supabase || (Date.now() >= supabase.expiredAt)) {
            if (!this._authenticating) {
                this._authenticating = this._getAccessToken();
            }
            accessToken = await this._authenticating;
        }
        else {
            accessToken = supabase.s;
        }
        this.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    protected async _getAccessToken() {
        const { dispatch, userActions } = this._store;

        try {
            const res = await privateApi.get<UserToken>(
                '/api/auth/token/supabase', { withCredentials: true }
            );
            dispatch(userActions.setSupabaseToken(res.data));
            return res.data.s;
        }
        catch (err) {
            // failed to obtain new token
            dispatch(userActions.setSupabaseToken(undefined));
            throw err;
        }
        finally {
            this._authenticating = undefined;
        }
    }
}

export const supabaseStorage = new SupabaseStorage();