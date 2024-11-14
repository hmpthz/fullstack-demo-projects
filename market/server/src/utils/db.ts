import mongoose from "mongoose";

declare global {
    namespace Express {
        interface Locals {
            db: typeof mongoose;
        }
    }
}

export async function connectDatabase() {
    if (process.env.DB_URL == undefined) {
        throw new Error('DB_URL not found');
    }
    const db_url = process.env.LOCAL_DB == undefined
        ? process.env.DB_URL
        : 'mongodb://127.0.0.1:5172/estate-market';

    await mongoose.connect(db_url);
    console.log('Database connected.');
    return mongoose;
}

export async function disconnectDatabase() {
    await mongoose.disconnect();
    console.log('Database disconnected.');
}