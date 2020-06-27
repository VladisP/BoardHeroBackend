import * as express from 'express';
import * as core from 'express-serve-static-core';
import { promisify } from 'util';
import { addFavoriteGame, authUser, createUser, getUser } from './service';
import { errorResponse, StatusCode, successResponse } from '../../common/responseSender';
import { ErrorMessage } from '../../common/errorMessages';
import { User } from './model';

export const userRouter = express.Router();

interface UserPostBody {
    username: string;
    password: string;
}

const authHandlerMaker = function (authMethod: (username: string, password: string) => Promise<User>): express.RequestHandler {
    return async function (req: express.Request<core.ParamsDictionary, unknown, UserPostBody>, res) {
        try {
            if (!req.body.username || !req.body.password) {
                errorResponse(req, res, StatusCode.BAD_REQUEST, new Error(ErrorMessage.INVALID_BODY));
                return;
            }

            const user = await authMethod(req.body.username, req.body.password);

            if (req.session) {
                req.session.userId = user.user_id;
            }

            successResponse(req, res, user);
        } catch (e) {
            switch ((e as Error).message) {
            case ErrorMessage.USER_EXIST:
            case ErrorMessage.USER_DOESNT_EXIST:
            case ErrorMessage.INCORRECT_CREDENTIALS:
                errorResponse(req, res, StatusCode.BAD_REQUEST, e);
                break;
            default:
                errorResponse(req, res, StatusCode.INTERNAL_ERROR, e);
            }
        }
    };
};

const signOutHandler: express.RequestHandler = async function (req, res) {
    try {
        if (req.session) {
            const destroySession = promisify(req.session.destroy.bind(req.session));
            await destroySession();
        }

        successResponse(req, res, null);
    } catch (e) {
        errorResponse(req, res, StatusCode.INTERNAL_ERROR, e);
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

const addFavoriteGameHandler: express.RequestHandler = async function (req, res) {
    if (req.session && req.session.userId) {
        try {
            await addFavoriteGame(req.session.userId, req.params.gameId);
            successResponse(req, res, null);
        } catch (e) {
            errorResponse(req, res, StatusCode.INTERNAL_ERROR, e);
        }
    } else {
        errorResponse(req, res, StatusCode.UNAUTHORIZED, new Error(ErrorMessage.UNAUTHORIZED));
    }
};

userRouter.route('/sign-up/').post(authHandlerMaker(createUser));
userRouter.route('/sign-in/').post(authHandlerMaker(authUser));
userRouter.route('/sign-out/').post(signOutHandler);
userRouter.route('/favorite-game/:gameId/').post(addFavoriteGameHandler);
userRouter.route('/').get(getUserHandler);