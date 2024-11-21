import { userModel } from '@/models/user.model.js';
import { type RequestHandler } from 'express';
import bcryptjs from 'bcryptjs';
import { HandledError } from '@/utils/errors.js';
import { sessionHandler, tokenRefreshHandler, type SessionHandler } from './auth.middleware.js';

type SignUpFormData = {
    email: string,
    username: string,
    password: string
}
export const signUp: RequestHandler<object, object, SignUpFormData> =
    async (req, res) => {
        const { email, username, password } = req.body;
        const hashedPassword = bcryptjs.hashSync(password, 10);
        const newUser = new userModel({
            email,
            username,
            password: hashedPassword,
            avatar: '/blank-profile.png'
        });
        await newUser.save();
        res.status(201).end();
    };

type SignInFormData = {
    email: string,
    password: string
}
export const signIn: SessionHandler<SignInFormData>[] = [
    async (req, res, next) => {
        const { email, password } = req.body;
        const foundUser = await userModel.findOne({ email });
        if (!foundUser) {
            return next(HandledError.list['signin|no_email|404']);
        }
        if (!bcryptjs.compareSync(password, foundUser.password)) {
            return next(HandledError.list['signin|wrong_credential|401']);
        }
        res.locals.user = foundUser;
        return next();
    },
    sessionHandler,
    tokenRefreshHandler(true)
];