import * as express from 'express';
import * as core from 'express-serve-static-core';
import { promisify } from 'util';
import { addFavoriteGame, authUser, createUser, deleteFavoriteGame, getUser } from './service';
import { errorResponse, StatusCode, successResponse } from '../../common/responseSender';
import { ErrorMessage } from '../../common/errorMessages';
import { FavoriteGameRecord, User } from './model';

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

const favoriteGameHandlerMaker = function (method: (userId: string, gameId: string) => Promise<FavoriteGameRecord | null>): express.RequestHandler {
    return async function (req, res) {
        if (req.session && req.session.userId) {
            try {
                const data = await method(req.session.userId, req.params.gameId);
                successResponse(req, res, data);
            } catch (e) {
                const code = (<Error>e).message === ErrorMessage.GAME_DOESNT_EXIST ? StatusCode.BAD_REQUEST : StatusCode.INTERNAL_ERROR;
                errorResponse(req, res, code, e);
            }
        } else {
            errorResponse(req, res, StatusCode.UNAUTHORIZED, new Error(ErrorMessage.UNAUTHORIZED));
        }
    };
};

userRouter.route('/sign-up/').post(authHandlerMaker(createUser));
userRouter.route('/sign-in/').post(authHandlerMaker(authUser));
userRouter.route('/sign-out/').post(signOutHandler);
userRouter.route('/favorite-game/:gameId/').post(favoriteGameHandlerMaker(addFavoriteGame));
userRouter.route('/favorite-game/:gameId/').delete(favoriteGameHandlerMaker(deleteFavoriteGame));
userRouter.route('/').get(getUserHandler);