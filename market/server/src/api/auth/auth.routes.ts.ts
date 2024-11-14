import { AsyncHandlingRouter } from '@/middlewares/async-router.js';
import { googleCallback, googleAuth } from './google.controllers.js';
import { signIn, signUp } from './password.controllers.js';

export const authRouter = AsyncHandlingRouter();

authRouter.post('/signup', signUp);
authRouter.post('/signin', ...signIn);
authRouter.get('/google', ...googleAuth);
authRouter.post('/google/callback', ...googleCallback);