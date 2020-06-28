import * as express from 'express';
import { errorResponse, StatusCode, successResponse } from '../../common/responseSender';
import { ErrorMessage } from '../../common/errorMessages';
import * as core from 'express-serve-static-core';
import { createReview, getReviewById, updateReviewRating } from './service';

export const reviewRouter = express.Router();

interface ReviewPostBody {
    title: string;
    description: string;
    rating: number;
}

interface RatingPostBody {
    isPositive: boolean | null | undefined;
}

const createReviewHandler: express.RequestHandler = async function (req: express.Request<core.ParamsDictionary, unknown, ReviewPostBody>, res) {
    if (req.session && req.session.userId) {
        if (!req.body.title || !req.body.description || !req.body.rating) {
            errorResponse(req, res, StatusCode.BAD_REQUEST, new Error(ErrorMessage.INVALID_BODY));
            return;
        }

        try {
            const reviewResponse = await createReview(
                req.params.gameId,
                req.session.userId,
                req.body.title,
                req.body.description,
                req.body.rating
            );

            successResponse(req, res, reviewResponse);
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

const getReviewHandler: express.RequestHandler = async function (req, res) {
    try {
        const review = await getReviewById(req.params.reviewId);
        successResponse(req, res, review);
    } catch (e) {
        const code = (<Error>e).message === ErrorMessage.REVIEW_DOESNT_EXIST ? StatusCode.BAD_REQUEST : StatusCode.INTERNAL_ERROR;
        errorResponse(req, res, code, e);
    }
};

const ratingHandler: express.RequestHandler = async function (req: express.Request<core.ParamsDictionary, unknown, RatingPostBody>, res) {
    if (req.session && req.session.userId) {
        if (typeof req.body.isPositive !== 'boolean') {
            errorResponse(req, res, StatusCode.BAD_REQUEST, new Error(ErrorMessage.INVALID_BODY));
            return;
        }

        try {
            const ratingResponse = await updateReviewRating(
                req.params.reviewId,
                req.session.userId,
                req.body.isPositive
            );

            successResponse(req, res, ratingResponse);
        } catch (e) {
            switch ((e as Error).message) {
            case ErrorMessage.REVIEW_DOESNT_EXIST:
            case ErrorMessage.INCORRECT_RATING:
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
reviewRouter.route('/:reviewId/').get(getReviewHandler);
reviewRouter.route('/rating/:reviewId/').post(ratingHandler);