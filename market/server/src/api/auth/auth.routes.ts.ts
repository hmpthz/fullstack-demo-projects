import { AsyncHandlingRouter } from '@/middlewares/async-router.js';
import { googleCallback, googleAuth } from './google.controllers.js';
import { signIn, signUp } from './password.controllers.js';
import { refresh } from './token.controllers.js';

export const authRouter = AsyncHandlingRouter();

authRouter.get('/refresh', ...refresh);
authRouter.post('/signup', signUp);
authRouter.post('/signin', ...signIn);
authRouter.get('/google', ...googleAuth);
authRouter.post('/google/callback', ...googleCallback);