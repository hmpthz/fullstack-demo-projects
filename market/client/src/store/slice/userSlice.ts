import { createSlice, type CaseReducer, type PayloadAction } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

export interface UserProfile {
    username: string;
    email: string;
    avatar: string;
}
interface UserState {
    profile?: UserProfile
}
const initialState: UserState = {}

const setUserProfile: CaseReducer<UserState, PayloadAction<UserProfile | undefined>> = (state, action) => {
    state.profile = action.payload;
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserProfile
    }
});

export const useUserDispatch = () => {
    const dispatch = useDispatch();

    return {
        dispatch,
        userActions: userSlice.actions
    };
};