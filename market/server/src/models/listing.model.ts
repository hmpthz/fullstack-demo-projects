import mongoose from "mongoose";
import type { StorageObject } from "./user.model.js";

const storageObjectSchema = new mongoose.Schema<StorageObject>({
    storageURL: {
        type: String
    },
    publicURL: {
        type: String,
        required: true
    }
});

export interface Listing {
    name: string;
    description: string;
    address: string;
    bathrooms: number;
    bedrooms: number;
    furnished: boolean;
    parking: boolean;
    images: StorageObject[];
    state: string;
    offer: boolean;
    regularPrice: number;
    discountedPrice: number;
    user: mongoose.ObjectId;
}
const listingSchema = new mongoose.Schema<Listing>({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    bathrooms: {
        type: Number,
        required: true
    },
    bedrooms: {
        type: Number,
        required: true
    },
    furnished: {
        type: Boolean,
        required: true
    },
    parking: {
        type: Boolean,
        required: true
    },
    images: {
        type: [storageObjectSchema],
        default: []
    },
    state: {
        type: String,
        required: true
    },
    offer: {
        type: Boolean,
        required: true
    },
    regularPrice: {
        type: Number,
        required: true
    },
    discountedPrice: {
        type: Number,
        required: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, { timestamps: true });

export const listingModel = mongoose.model<Listing>('Listing', listingSchema);
export type ListingDoc = ConstructorReturnType<typeof listingModel>;