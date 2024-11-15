import mongoose from "mongoose";

export type Session = {
    /** Can be seen as a session id */
    refreshToken: string,
    /** Epoch in milliseconds */
    expiredAt: number
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

export type Credential = {
    issuer: string,
    sub: string
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

export type User = {
    email: string,
    username: string,
    password: string,
    avatar: string,
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
        type: String,
        required: true
    },
    session: sessionSchema,
    credentials: {
        type: [credentialSchema],
        default: [] // don't need this, mongoose add empty array by default
    }
},
    { timestamps: true });

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