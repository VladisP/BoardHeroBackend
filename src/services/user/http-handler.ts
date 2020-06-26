import * as express from 'express';
import * as core from 'express-serve-static-core';
import { createUser } from './service';
import { errorResponse, StatusCode, successResponse } from '../../common/responseSender';
import { ErrorMessage } from '../../common/errorMessages';

export const userRouter = express.Router();

interface UserPostBody {
    username: string;
    password: string;
}

const signUpHandler: express.RequestHandler = async function (req: express.Request<core.ParamsDictionary, unknown, UserPostBody>, res) {
    try {
        if (!req.body.username || !req.body.password) {
            errorResponse(req, res, StatusCode.BAD_REQUEST, new Error(ErrorMessage.INVALID_BODY));
            return;
        }

        const user = await createUser(req.body.username, req.body.password);

        if (req.session) {
            req.session.userId = user.user_id;
        }

        successResponse(req, res, user);
    } catch (e) {
        const code = (e as Error).message === ErrorMessage.USER_EXIST ? StatusCode.BAD_REQUEST : StatusCode.INTERNAL_ERROR;
        errorResponse(req, res, code, e);
    }
};

userRouter.route('/sign-up/').post(signUpHandler);