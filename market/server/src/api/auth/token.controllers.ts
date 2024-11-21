import { HandledError } from '@/utils/errors.js';
import { tokenRefreshHandler, type SessionHandler } from './auth.middleware.js';
import { userModel } from '@/models/user.model.js';

export const refresh: SessionHandler[] = [
    async (req, res, next) => {
        let refreshToken: string | undefined;
        if (!refreshToken) {
            return next(HandledError.list['session|no_refresh_token|401']);
        }
        const foundUser = await userModel.findOne({ 'session.refreshToken': refreshToken });
        if (!foundUser) {
            return next(HandledError.list['session|invalid_refresh_token|401']);
        }
        if (Date.now() >= foundUser.session!.expiredAt) {
            return next(HandledError.list['session|expired|403']);
        }
    },
    tokenRefreshHandler(false)
]