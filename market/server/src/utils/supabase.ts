import { env } from "@/env.js";
import type { StorageObject } from "@/models/user.model.js";

declare global {
    namespace Express {
        interface Locals {
            supabaseUtils: SupabaseUtils;
        }
    }
}

const extname = (filename: string) => filename.slice(filename.lastIndexOf('.'));
const randStr = () => Math.random().toString(36).slice(2); // pretend we're hashing the file

export class SupabaseUtils {
    protected url: string;
    protected publicURL: string;

    constructor() {
        this.url = `${env.SUPABASE_URL}/storage/v1`;
        this.publicURL = `${this.url}/object/public/estate-market${env.VERCEL ? '' : '-dev'}`;
    }

    getAvatarURL(filename: string | undefined, userId: string): StorageObject | undefined {
        if (!filename) return undefined;
        const storageURL = `avatar/${userId}${extname(filename)}`;
        // add a hashtag url param so that browser can refetch image even if url is unchanged
        const publicURL = `${this.publicURL}/${storageURL}?hashtag=${randStr()}`;
        return { storageURL, publicURL };
    }

    getListingURLs(filenames: string[], listingId: string) {
        const objs: StorageObject[] = [];
        for (const filename of filenames) {
            const storageURL = `listing/${listingId}/${randStr()}${extname(filename)}`;
            const publicURL = `${this.publicURL}/${storageURL}`;
            objs.push({ storageURL, publicURL });
        }
        return objs;
    }
}