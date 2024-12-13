import bcryptjs from 'bcryptjs';
import { privateHandler, type PrivateHandler } from '@/middlewares/auth.middleware.js';
import { userModel, type User, type UserProfile } from '@/models/user.model.js';
import { HandledError } from '@/utils/errors.js';

type IdParam = ReqParam<'id'>;
type UpdateUserRequest = Partial<Pick<User, 'email' | 'username' | 'password'> & { avatarFilename: string }>;
type UpdateUserData = Partial<Pick<User, 'email' | 'username' | 'password' | 'avatar'>>;

export const updateUser: PrivateHandler<UpdateUserRequest, IdParam>[] = [
    privateHandler,
    async (req, res, next) => {
        const { userId, supabaseUtils } = res.locals;
        if (req.params.id != userId) {
            return next(HandledError.list['param|wrong_userid|403']);
        }
        // do not use spread syntax in case of propertis that aren't supposed to exist
        const updateData: UpdateUserData = {
            email: req.body.email,
            username: req.body.username,
            avatar: supabaseUtils.getAvatarURL(req.body.avatarFilename, userId)
        };
        if (req.body.password) {
            updateData.password = bcryptjs.hashSync(req.body.password, 10);
        }

        const user = await userModel.findByIdAndUpdate(
            userId, { $set: updateData }, { new: true }
        );
        if (!user) {
            return next(HandledError.list['param|wrong_userid|403']);
        }
        const resBody: UserProfile = {
            id: userId,
            email: user.email,
            username: user.username,
            avatar: user.avatar
        };
        res.json(resBody);
    }
];

export const deleteUser: PrivateHandler<object, IdParam>[] = [
    privateHandler,
    async (req, res, next) => {
        if (req.params.id != res.locals.userId) {
            return next(HandledError.list['param|wrong_userid|403']);
        }
        const user = await userModel.findByIdAndDelete(req.params.id, { new: true });
        if (!user) {
            return next(HandledError.list['param|wrong_userid|403']);
        }
        // TODO: also delete avatar from stroage
        res.clearCookie('refresh_token').clearCookie('has_refresh_token');
        res.status(200).end();
    }
];

export const signOut: PrivateHandler[] = [
    privateHandler,
    async (_req, res, next) => {
        const user = await userModel.findByIdAndUpdate(
            res.locals.userId, { $unset: { session: 1 } }, { new: true }
        );
        if (!user) {
            return next(HandledError.list['param|wrong_userid|403']);
        }
        res.clearCookie('refresh_token').clearCookie('has_refresh_token');
        res.status(200).end();
    }
];