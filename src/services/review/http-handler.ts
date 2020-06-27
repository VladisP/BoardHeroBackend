import * as express from 'express';
import { errorResponse, StatusCode, successResponse } from '../../common/responseSender';
import { ErrorMessage } from '../../common/errorMessages';
import * as core from 'express-serve-static-core';
import { createReview } from './service';

export const reviewRouter = express.Router();

interface ReviewPostBody {
    title: string;
    description: string;
    rating: number;
}

const createReviewHandler: express.RequestHandler = async function (req: express.Request<core.ParamsDictionary, unknown, ReviewPostBody>, res) {
    if (req.session && req.session.userId) {
        if (!req.body.title || !req.body.description || !req.body.rating) {
            errorResponse(req, res, StatusCode.BAD_REQUEST, new Error(ErrorMessage.INVALID_BODY));
            return;
        }

        try {
            const review = await createReview(
                req.params.gameId,
                req.session.userId,
                req.body.title,
                req.body.description,
                req.body.rating
            );

            successResponse(req, res, review);
        } catch (e) {
            switch ((e as Error).message) {
            case ErrorMessage.GAME_DOESNT_EXIST:
            case ErrorMessage.REVIEW_EXIST:
                errorResponse(req, res, StatusCode.BAD_REQUEST, e);
                break;
            default:
                errorResponse(req, res, StatusCode.INTERNAL_ERROR, e);
            }
        }
    } else {
        errorResponse(req, res, StatusCode.UNAUTHORIZED, new Error(ErrorMessage.UNAUTHORIZED));
    }
};

reviewRouter.route('/:gameId/').post(createReviewHandler);