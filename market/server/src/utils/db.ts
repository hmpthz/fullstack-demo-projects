import { env } from "@/env.js";
import mongoose, { STATES } from "mongoose";

declare global {
    namespace Express {
        interface Locals {
            db: typeof mongoose;
        }
    }
}

export async function connectDatabase() {
    const state = mongoose.connection.readyState;
    if (state != STATES.connected && state != STATES.connecting) {
        const db_url = !env.LOCAL_DB
            ? env.DB_URL
            : 'mongodb://127.0.0.1:5172/estate-market';
        await mongoose.connect(db_url, { connectTimeoutMS: 3000 });
        console.log('Database connected.');
    }
    return mongoose;
}