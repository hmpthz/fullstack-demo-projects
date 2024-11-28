import { AsyncHandlingRouter } from '@/middlewares/async-router.js';
import { googleCallback, googleAuth } from './google.controllers.js';
import { signIn, signUp } from './password.controllers.js';
import { tokenRefresh, tokenSupabase } from './token.controllers.js';

export const authRouter = AsyncHandlingRouter();

authRouter.get('/token/refresh', ...tokenRefresh);
authRouter.get('/token/supabase', ...tokenSupabase);

authRouter.post('/signup', signUp);
authRouter.post('/signin', ...signIn);
authRouter.get('/google', ...googleAuth);
authRouter.post('/google/callback', ...googleCallback);