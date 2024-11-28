type ValidateFunc<T> = (d: T) => true | string
// eslint-disable-next-line
type FormValidator<T = any> = {
    [P in keyof T]: ValidateFunc<T>
};

type AllFields = {
    email: string,
    username: string,
    password: string
}
const list = {
    validators: ({
        email: (d) => (/^\S+@\S+\.\S+$/).test(d.email) ? true
            : 'Not a valid email',
        username: (d) => d.username.length >= 3 ? true
            : 'Username should be at least 3 characters',
        password: (d) => d.password.length >= 4 ? true
            : 'Password should be at least 4 characters'
    } as FormValidator<AllFields>) as FormValidator,

    required_errors: ({
        email: 'Email is required',
        username: 'Username is required',
        password: 'Password is required'
    } as Record<keyof AllFields, string>) as Record<string, string>
};

export function getValidator(schema: Partial<Record<keyof AllFields, boolean>>) {
    const map = {} as FormValidator;
    for (const [key, required] of Object.entries(schema)) {
        if (typeof required != 'boolean') continue;
        const f = list.validators[key];
        if (required) {
            map[key] = (d) => d[key] ? f(d) : list.required_errors[key];
        }
        else {
            map[key] = (d) => d[key] ? f(d) : true;
        }
    }

    return function validate(data: Partial<AllFields>) {
        for (const key of Object.keys(schema)) {
            const res = map[key](data);
            if (res !== true) {
                return res;
            }
        }
        return true;
    }
}