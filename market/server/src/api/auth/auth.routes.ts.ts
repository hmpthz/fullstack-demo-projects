import express from 'express';
import { googleCallback, googleAuth } from './google.controllers.js';

export const authRouter = express.Router();

authRouter.get('/google', ...googleAuth);
authRouter.post('/google/callback', ...googleCallback);