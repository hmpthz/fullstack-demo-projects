import { createSlice, type CaseReducer, type PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from "redux-persist/lib/storage";

export interface StorageObject {
    storageURL?: string,
    publicURL: string
}
export interface UserProfile {
    id: string;
    email: string;
    username: string;
    avatar: StorageObject;
}
export interface UserToken {
    s: string,
    expiredAt: number
}
export interface TokenRefresh_Response {
    accessToken: UserToken;
    profile: UserProfile;
}
interface UserStore extends Partial<TokenRefresh_Response> {
    firstTime: boolean;
    supabase?: UserToken;
}
const initialState: UserStore = { firstTime: true }

const setProfile: CaseReducer<UserStore, PayloadAction<UserProfile>> = (state, action) => {
    state.profile = action.payload;
}
const setTokenRefresh: CaseReducer<UserStore, PayloadAction<TokenRefresh_Response | undefined>> = (state, action) => {
    state.accessToken = action.payload?.accessToken;
    state.profile = action.payload?.profile;
    if (state.accessToken) {
        state.accessToken.expiredAt *= 1000; // seconds to milliseconds
    }
}
const setSupabaseToken: CaseReducer<UserStore, PayloadAction<UserToken | undefined>> = (state, action) => {
    state.supabase = action.payload;
    if (state.supabase) {
        state.supabase.expiredAt *= 1000; // seconds to milliseconds
    }
}
const notFirstTime: CaseReducer<UserStore> = (state) => {
    state.firstTime = false;
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setProfile,
        setTokenRefresh,
        setSupabaseToken,
        notFirstTime
    }
});
export const userReducers = persistReducer({
    key: 'user',
    storage,
    version: 1,
    whitelist: ['profile']
}, userSlice.reducer);
export const userActions = userSlice.actions;