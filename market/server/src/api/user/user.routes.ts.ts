import { AsyncHandlingRouter } from '@/middlewares/async-router.js';
import { updateUser } from './user.controllers.js';

export const userRouter = AsyncHandlingRouter();

userRouter.post('/update/:id', ...updateUser);