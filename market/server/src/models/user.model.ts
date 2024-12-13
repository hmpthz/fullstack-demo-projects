import mongoose from "mongoose";

export interface Session {
    /** Can be seen as a session id */
    refreshToken: string;
    /** Epoch in milliseconds */
    expiredAt: number;
}
const sessionSchema = new mongoose.Schema<Session>({
    refreshToken: {
        type: String,
        required: true
    },
    expiredAt: {
        type: Number,
        requried: true
    }
});

export interface Credential {
    issuer: string;
    sub: string;
}
const credentialSchema = new mongoose.Schema<Credential>({
    issuer: {
        type: String,
        required: true
    },
    sub: {
        type: String,
        required: true
    }
});

export interface StorageObject0 {
    storageURL?: string;
    publicURL: string;
}
export type StorageObject = Required<StorageObject0>;
const storageObject0Schema = new mongoose.Schema<StorageObject0>({
    storageURL: {
        type: String
    },
    publicURL: {
        type: String,
        required: true
    }
});

export interface UserProfile {
    id: string;
    email: string,
    username: string,
    avatar: StorageObject0,
}
export interface User extends UserProfile {
    password: string,
    session?: Session,
    credentials: Credential[]
}
const userSchema = new mongoose.Schema<User>({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: storageObject0Schema,
        required: true
    },
    session: sessionSchema,
    credentials: {
        type: [credentialSchema],
        default: [] // don't need this, mongoose add empty array by default
    }
}, { timestamps: true });

userSchema.index({ 'email': 1 }, { unique: true });
userSchema.index({ 'session.refreshToken': 1 }, { unique: true });
userSchema.index({ 'credentials.issuer': 1, 'credentials.sub': 1 }, { unique: true });

export const userModel = mongoose.model<User>('User', userSchema);
export type UserDoc = ConstructorReturnType<typeof userModel>;
/** Hydrated */
export type UserSubDocs = {
    session: mongoose.Types.Subdocument<mongoose.Types.ObjectId, object, Session> & Session,
    credentials: mongoose.Types.DocumentArray<Credential>
}