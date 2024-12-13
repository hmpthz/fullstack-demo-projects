import { AsyncHandlingRouter } from "@/middlewares/async-router.js";
import { userRouter } from "./user/user.routes.ts.js";
import { authRouter } from "./auth/auth.routes.ts.js";
import { listingRouter } from "./listing/listing.routes.js";

export const apiRouter = AsyncHandlingRouter();

apiRouter.use('/auth', authRouter);
apiRouter.use('/listing', listingRouter);
apiRouter.use('/user', userRouter);