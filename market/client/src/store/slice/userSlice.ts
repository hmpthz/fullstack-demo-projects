import { createSlice, type CaseReducer, type PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from "redux-persist/lib/storage";

export interface UserToken {
    s: string,
    expiredAt: number
}
export interface UserProfile {
    id: string;
    username: string;
    email: string;
    avatar: string;
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

const setTokenRefresh: CaseReducer<UserStore, PayloadAction<TokenRefresh_Response | undefined>> = (state, action) => {
    state.accessToken = action.payload?.accessToken;
    state.profile = action.payload?.profile;
}
const setSupabaseToken: CaseReducer<UserStore, PayloadAction<UserToken | undefined>> = (state, action) => {
    state.supabase = action.payload;
}
const notFirstTime: CaseReducer<UserStore> = (state) => {
    state.firstTime = false;
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
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