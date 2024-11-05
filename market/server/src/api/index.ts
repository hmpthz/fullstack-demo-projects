import express from "express";
import { userRouter } from "./user/user.routes.ts.js";
import { authRouter } from "./auth/auth.routes.ts.js";

export const apiRouter = express.Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/user', userRouter);