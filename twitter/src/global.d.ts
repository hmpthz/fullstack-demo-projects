import type {
    ReactNode,
    Dispatch,
    SetStateAction
} from 'react';

declare global {
    interface ChildrenProps {
        children: ReactNode
    }
    interface ClassProps {
        className?: string
    }

    type ReactSetState<T> = Dispatch<SetStateAction<T>>;
    type ReactState<T> = [T, ReactSetState];

    declare module '*.css' {
        const classes: string
        export default classes
    }
}