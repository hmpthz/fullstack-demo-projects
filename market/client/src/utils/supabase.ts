import { StorageClient } from '@hmpthz/supabase-storage-js';
import { getRootStore } from '@/store/store';
import { privateApi } from './axios';
import type { UserToken } from '@/store/slice/userSlice';

class SupabaseStorage extends StorageClient {
    protected _store = getRootStore();
    protected _authenticating?: Promise<string>;

    constructor() {
        super(`https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1`, {});
    }

    async uploadAvatar(file: File) {
        await this.setAutHeader();
        const profile = this._store.getState().user.profile;
        if (!profile) {
            throw 'User profile not found';
        }
        const extname = file.name.slice(file.name.lastIndexOf('.'));
        return this.from('estate-market')
            .upload(`/avatar/${profile.id}${extname}`, file, {
                cacheControl: '86400',
                upsert: true
            });
    }

    async setAutHeader() {
        const user = this._store.getState().user;
        let accessToken: string;
        if (!user.accessToken || (Date.now() >= user.accessToken.expiredAt)) {
            if (!this._authenticating) {
                this._authenticating = this._getAccessToken();
            }
            accessToken = await this._authenticating;
        }
        else {
            accessToken = user.accessToken.s;
        }
        this.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    protected async _getAccessToken() {
        const { dispatch, userActions } = this._store;

        try {
            const res = await privateApi.get<UserToken>(
                '/api/user/supabase-storage', { withCredentials: true }
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