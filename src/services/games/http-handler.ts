import * as express from 'express';
import { getGames } from './service';
import { errorResponse, StatusCode, successResponse } from '../../common/responseSender';

export const gamesRouter = express.Router();

const gamesHandler: express.RequestHandler = async function (req, res) {
    try {
        const games = await getGames();
        successResponse(req, res, games);
    } catch (e) {
        errorResponse(req, res, StatusCode.INTERNAL_ERROR, e);
    }
};

gamesRouter.route('/').get(gamesHandler);