import { userRouter } from "./user/user.routes.ts.js";
import { authRouter } from "./auth/auth.routes.ts.js";
import { AsyncHandlingRouter } from "@/middlewares/async-router.js";

export const apiRouter = AsyncHandlingRouter();

apiRouter.use('/auth', authRouter);
apiRouter.use('/user', userRouter);