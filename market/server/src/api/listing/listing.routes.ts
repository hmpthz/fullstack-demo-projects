import { AsyncHandlingRouter } from "@/middlewares/async-router.js";
import { createListing } from "./listing.controllers.js";

export const listingRouter = AsyncHandlingRouter();

listingRouter.post('/create', ...createListing);