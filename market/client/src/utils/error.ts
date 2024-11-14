/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError } from "axios";

export function getErrorMessage(err: any) {
    if (err instanceof AxiosError
        && err.response?.data
        && typeof err.response.data == 'object') {
        return err.response.data.error as string;
    }
    return (err as object).toString();
}