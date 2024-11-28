import { AxiosError } from "axios";

type _ReadableAxiosError = AxiosError<{ error: string }>;
type ReadableAxiosError = _ReadableAxiosError & Required<Pick<_ReadableAxiosError, 'response'>>;

export function isReadableError(err: unknown): err is ReadableAxiosError {
    return err instanceof AxiosError
        && typeof err.response?.data?.error == 'string';
}

export function getErrorMessage(err: unknown) {
    if (isReadableError(err)) {
        return err.response.data.error;
    }
    return typeof err == 'string'
        ? err
        : err instanceof Error
            ? err.toString()
            : JSON.stringify(err);
}

export function joinErrors(errors: (string | null)[]) {
    let res: string | null = null;
    for (const msg of errors) {
        if (msg) {
            res = res ? `${res};${msg}` : msg;
        }
    }
    return res;
}