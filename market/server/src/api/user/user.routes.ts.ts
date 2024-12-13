import { AsyncHandlingRouter } from '@/middlewares/async-router.js';
import { deleteUser, signOut, updateUser } from './user.controllers.js';

export const userRouter = AsyncHandlingRouter();

userRouter.post('/signout', ...signOut);
userRouter.patch('/action/:id', ...updateUser);
userRouter.delete('/action/:id', ...deleteUser);