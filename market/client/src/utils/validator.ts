export const validator = {
    errors: {
        username: 'Username should be at least 3 characters',
        email: 'Not a valid email',
        password: 'Password should be at least 4 characters'
    },
    username: (d: { username: string }) => d.username.length >= 3,
    email: (d: { email: string }) => (/^\S+@\S+\.\S+$/).test(d.email),
    password: (d: { password: string }) => d.password.length >= 4
};