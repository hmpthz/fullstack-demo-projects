import { AsyncHandlingRouter } from "@/middlewares/async-router.js";
import { createListing, userListing } from "./listing.controllers.js";

export const listingRouter = AsyncHandlingRouter();

listingRouter.post('/create', ...createListing);
listingRouter.get('/user/:userId', userListing);