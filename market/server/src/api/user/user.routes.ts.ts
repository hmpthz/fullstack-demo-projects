import { AsyncHandlingRouter } from '@/middlewares/async-router.js';
import { supabaseStorage } from './supabase.controllers.js';

export const userRouter = AsyncHandlingRouter();

userRouter.get('/supabase-storage', ...supabaseStorage);