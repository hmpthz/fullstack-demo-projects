import { privateHandler, type PrivateHandler } from '@/middlewares/auth.middleware.js';
import { listingModel, type Listing } from '@/models/listing.model.js';

type ListingFormData = Omit<Listing, 'images' | 'user'> & { imageFilenames: string[] };

export const createListing: PrivateHandler<ListingFormData>[] = [
    privateHandler,
    async (req, res) => {
        const { userId, supabaseUtils, db } = res.locals;
        const { imageFilenames, ...formData } = req.body;

        const newListing = new listingModel({ ...formData, images: [], user: new db.Types.ObjectId(userId)});
        const listingId = newListing.id;
        newListing.images = supabaseUtils.getListingURLs(imageFilenames, listingId);
        await newListing.save();
        res.status(201).json(newListing.toJSON());
    }
]