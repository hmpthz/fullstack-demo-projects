import bcryptjs from 'bcryptjs';
import { privateHandler, type PrivateHandler } from '@/middlewares/auth.middleware.js';
import { userModel, type User, type UserProfile } from '@/models/user.model.js';
import { HandledError } from '@/utils/errors.js';

type UpdateUser_Request = Partial<Omit<User, 'id' | 'session' | 'credentials'>>;

export const updateUser: PrivateHandler<UpdateUser_Request, ReqParam<'id'>>[] = [
    privateHandler,
    async (req, res, next) => {
        if (req.params.id != res.locals.userId) {
            return next(HandledError.list['update|wrong_userid|403']);
        }
        // do not use spread syntax in case of propertis that aren't supposed to exist
        const updateData: UpdateUser_Request = {
            email: req.body.email,
            username: req.body.username,
            avatar: req.body.avatar
        };
        if (req.body.password) {
            updateData.password = bcryptjs.hashSync(req.body.password, 10);
        }

        const user = await userModel.findByIdAndUpdate(
            req.params.id, { $set: updateData }, { new: true }
        );
        if (!user) {
            return next(HandledError.list['update|wrong_userid|403']);
        }
        const resBody: UserProfile = {
            id: user.id,
            email: user.email,
            username: user.username,
            avatar: user.avatar
        };
        res.json(resBody);
    }
];