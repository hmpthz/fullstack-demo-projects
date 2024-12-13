import { StorageClient } from '@hmpthz/supabase-storage-js';
import { getRootStore } from '@/store/store';
import { privateApi } from './axios';
import type { StorageObject0, StorageObject, UserToken } from '@/store/slice/userSlice';
import { getErrorMessage, joinErrors } from './error';

type SupabaseResult<T> = { data: T, error: null } | { data: null, error: string };
export type UploadState = 'none' | 'uploading' | 'success' | 'error';

class SupabaseStorage extends StorageClient {
    protected bucket: ReturnType<StorageClient['from']>;
    protected _store = getRootStore();
    protected _authenticating?: Promise<SupabaseResult<string>>;

    constructor() {
        super(`${SUPABASE_URL}/storage/v1`, {});
        this.bucket = this.from('estate-market');
    }
    async uploadDifference(file: File, newObj: StorageObject, oldObj: StorageObject0) {
        const err = await this._setAuthHeader();
        if (err != null) throw err;

        const tasks: Promise<string | null>[] = [];
        tasks.push(this.upsertFile(newObj.storageURL!, file));
        if (oldObj.storageURL && oldObj.storageURL != newObj.storageURL) {
            tasks.push(this.deleteFiles([oldObj.storageURL]));
        }
        joinErrors(await Promise.all(tasks));
    }
    async uploadMany(files: File[], objs: StorageObject[], setState?: (s: UploadState, i?: number) => void) {
        const err = await this._setAuthHeader();
        if (err != null) throw err;

        setState?.('uploading');
        return Promise.all(files.map((file, i) =>
            this.upsertFile(objs[i].storageURL, file).then(err => {
                setState?.(err ? 'error' : 'success', i);
                return err;
            })
        ));
    }

    upsertFile(url: string, file: File, cacheControl = '86400') {
        return this.bucket.upload(url, file, { cacheControl, upsert: true })
            .then(({ error }) => error ? getErrorMessage(error) : null);
    }
    deleteFiles(urls: string[]) {
        return this.bucket.remove(urls)
            .then(({ error }) => error ? getErrorMessage(error) : null);
    }

    protected async _setAuthHeader() {
        const supabase = this._store.getState().user.supabase;
        let accessToken: string;
        if (!supabase || (Date.now() >= supabase.expiredAt)) {
            if (!this._authenticating) {
                this._authenticating = this._getAccessToken();
            }
            const result = await this._authenticating;
            if (result.data != null)
                accessToken = result.data;
            else
                return result.error;
        }
        else {
            accessToken = supabase.s;
        }
        this.headers['Authorization'] = `Bearer ${accessToken}`;
        return null;
    }
    protected async _getAccessToken(): Promise<SupabaseResult<string>> {
        const { dispatch, userActions } = this._store;
        try {
            const res = await privateApi.get<UserToken>(
                '/api/auth/token/supabase', { withCredentials: true }
            );
            dispatch(userActions.setSupabaseToken(res.data));
            return { data: res.data.s, error: null };
        }
        catch (err) {
            // failed to obtain new token
            dispatch(userActions.setSupabaseToken(undefined));
            return { data: null, error: err as string };
        }
        finally {
            this._authenticating = undefined;
        }
    }
}

export const supabaseStorage = new SupabaseStorage();