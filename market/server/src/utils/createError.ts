export interface HandledError {
    name: string;
    message: string;
    statusCode?: number;
}

export const createError = (name: string, message: string, statusCode: number) => ({
    name, message, statusCode
} as HandledError);