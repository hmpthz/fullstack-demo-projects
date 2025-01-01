import type { RequestHandler } from 'express';
import { privateHandler, type PrivateHandler } from '@/middlewares/auth.middleware.js';
import { listingModel, type Listing } from '@/models/listing.model.js';

type ListingFormData = Omit<Listing, 'images' | 'user'> & { imageFilenames: string[] };

export const createListing: PrivateHandler<ListingFormData>[] = [
    privateHandler,
    async (req, res) => {
        const { userId, supabaseUtils, db } = res.locals;
        const { imageFilenames, ...formData } = req.body;

        const newListing = new listingModel({ ...formData, images: [], user: new db.Types.ObjectId(userId) });
        const listingId = newListing.id;
        newListing.images = supabaseUtils.getListingURLs(imageFilenames, listingId);
        await newListing.save();
        res.status(201).json(newListing.toJSON());
    }
];

export const userListing: RequestHandler<{ userId: string }> =
    async (req, res) => {
        const { db } = res.locals;
        const userId = new db.Types.ObjectId(req.params.userId);
        const found = await listingModel.find({ user: userId }, { name: 1, images: 1 });
        res.json(found.map(listing => listing.toJSON()));
    };