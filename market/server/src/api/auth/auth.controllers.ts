import { userModel } from '@/models/user.model.js';
import { type RequestHandler } from 'express';
import bcryptjs from 'bcryptjs';

type SignUpFormData = {
    username: string;
    email: string;
    password: string;
}

const signUp: RequestHandler<object, object, SignUpFormData> =
    async (req, res) => {
        const { username, email, password } = req.body;
        const hashedPassword = bcryptjs.hashSync(password, 10);
        const newUser = new userModel(req.body);
    };