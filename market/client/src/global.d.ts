/// <reference types="vite/client" />
import type { ReactNode, Dispatch, SetStateAction } from 'react';

declare global {
    const SUPABASE_URL: string;
    const DEBUG_IGNORE_TOKEN: boolean;

    interface ChildrenProps {
        children: ReactNode
    }
    interface ClassProps {
        className: string
    }

    type ReactSetState<T> = Dispatch<SetStateAction<T>>;
    type ReactState<T> = [T, ReactSetState];
}