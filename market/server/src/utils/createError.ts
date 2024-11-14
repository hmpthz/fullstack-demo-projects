export class HandledError {
    errmsg: string;
    statusCode: number;

    constructor(name: string, message: string, statusCode: number) {
        this.errmsg = `${name}: ${message}`;
        this.statusCode = statusCode;
    }
}

export const createError = (...args: ConstructorParameters<typeof HandledError>) =>
    new HandledError(...args);