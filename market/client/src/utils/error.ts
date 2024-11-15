import { AxiosError } from "axios";

export function getErrorMessage(err: unknown) {
    if (err instanceof AxiosError
        && err.response?.data
        && typeof err.response.data == 'object') {
        return err.response.data.error as string;
    }
    return (err as object).toString();
}