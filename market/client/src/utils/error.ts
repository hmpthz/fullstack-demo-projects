import { AxiosError } from "axios";

type _ReadableAxiosError = AxiosError<{ error: string }>;
type ReadableAxiosError = _ReadableAxiosError & Required<Pick<_ReadableAxiosError, 'response'>>;

export function isReadableError(err: unknown): err is ReadableAxiosError {
    return err instanceof AxiosError
        && typeof err.response?.data == 'object'
        && typeof err.response.data.error == 'string';
}
export function getErrorMessage(err: unknown) {
    if (isReadableError(err)) {
        return err.response.data.error;
    }
    return (err as object).toString();
}