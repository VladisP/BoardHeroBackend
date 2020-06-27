import * as express from 'express';
import * as core from 'express-serve-static-core';
import { createUser, getUser } from './service';
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

const getUserHandler: express.RequestHandler = async function (req, res) {
    if (req.session && req.session.userId) {
        try {
            const user = await getUser(req.session.userId);
            successResponse(req, res, user);
        } catch (e) {
            errorResponse(req, res, StatusCode.INTERNAL_ERROR, e);
        }
    } else {
        errorResponse(req, res, StatusCode.UNAUTHORIZED, new Error(ErrorMessage.UNAUTHORIZED));
    }
};

userRouter.route('/sign-up/').post(signUpHandler);
userRouter.route('/').get(getUserHandler);