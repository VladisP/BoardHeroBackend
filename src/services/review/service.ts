import { ServerConfig } from '../../config/config';
import { getGameById, updateGameRating } from '../games/service';
import { ErrorMessage } from '../../common/errorMessages';
import { v4 as uuidv4 } from 'uuid';
import { IdReview, Review, ReviewRating } from './model';
import { PoolClient } from 'pg';
import { updateUserKarma } from '../user/service';

interface ReviewResponse {
    review_id: string;
    new_game_rating: number;
}

interface RatingResponse {
    is_positive: boolean | null;
    new_score: number;
}

export async function createReview(gameId: string, userId: string, title: string, description: string, rating: number): Promise<ReviewResponse> {
    const { pool } = ServerConfig.get();
    const game = await getGameById(gameId);

    if (!game) {
        throw new Error(ErrorMessage.GAME_DOESNT_EXIST);
    }

    const review = await getReviewByIds(gameId, userId);

    if (review) {
        throw new Error(ErrorMessage.REVIEW_EXIST);
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const reviewRes = await client.query<IdReview>(
            'INSERT INTO reviews(review_id, board_game_id, user_id, title, description, rating, created_at) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING review_id AS id;',
            [uuidv4(), gameId, userId, title, description, rating, new Date()]
        );

        const newRating = await updateGameRating(client, gameId);

        await client.query('COMMIT');

        return { review_id: reviewRes.rows[0].id, new_game_rating: newRating };
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

export async function getUserReviews(userId: string): Promise<Array<IdReview>> {
    const { pool } = ServerConfig.get();

    const reviewsRes = await pool.query<IdReview>(
        'SELECT review_id AS id FROM reviews WHERE user_id=$1',
        [userId]
    );

    return reviewsRes.rows;
}

export async function getGameReviews(gameId: string): Promise<Array<IdReview>> {
    const { pool } = ServerConfig.get();

    const reviewsRes = await pool.query<IdReview>(
        'SELECT review_id AS id FROM reviews WHERE board_game_id=$1',
        [gameId]
    );

    return reviewsRes.rows;
}

export async function getReviewById(id: string): Promise<Review> {
    const { pool } = ServerConfig.get();

    const reviewRes = await pool.query<Review>(
        'SELECT * FROM reviews WHERE review_id=$1',
        [id]
    );

    if (!reviewRes.rows[0]) {
        throw new Error(ErrorMessage.REVIEW_DOESNT_EXIST);
    }

    return reviewRes.rows[0];
}

export async function updateReviewRating(reviewId: string, userId: string, isPositive: boolean): Promise<RatingResponse> {
    const review = await getReviewById(reviewId);

    if (!review) {
        throw new Error(ErrorMessage.REVIEW_DOESNT_EXIST);
    }

    const rating = await getReviewRating(reviewId, userId);

    if (rating && ((rating.is_positive && isPositive) || (!rating.is_positive && !isPositive))) {
        throw new Error(ErrorMessage.INCORRECT_RATING);
    }

    const client = await ServerConfig.get().pool.connect();

    try {
        await client.query('BEGIN');
        const is_positive = rating ? null : isPositive;

        if (!rating) {
            await insertReviewRating(client, reviewId, userId, isPositive);
        } else {
            await deleteReviewRating(client, reviewId, userId);
        }

        const new_score = await updateReviewScore(client, reviewId, isPositive);
        await updateUserKarma(client, review.user_id, isPositive);
        await client.query('COMMIT');

        return { is_positive, new_score };
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

async function getReviewByIds(gameId: string, userId: string): Promise<IdReview> {
    const { pool } = ServerConfig.get();

    const reviewRes = await pool.query<IdReview>(
        'SELECT review_id AS id FROM reviews WHERE board_game_id=$1 AND user_id=$2',
        [gameId, userId]
    );

    return reviewRes.rows[0];
}

async function getReviewRating(reviewId: string, userId: string): Promise<ReviewRating> {
    const { pool } = ServerConfig.get();

    const ratingRes = await pool.query<ReviewRating>(
        'SELECT * FROM review_ratings WHERE review_id=$1 AND user_id=$2',
        [reviewId, userId]
    );

    return ratingRes.rows[0];
}

async function insertReviewRating(client: PoolClient, reviewId: string, userId: string, isPositive: boolean): Promise<void> {
    await client.query(
        'INSERT INTO review_ratings(review_id, user_id, is_positive) ' +
        'VALUES ($1, $2, $3)',
        [reviewId, userId, isPositive]
    );
}

async function deleteReviewRating(client: PoolClient, reviewId: string, userId: string): Promise<void> {
    await client.query(
        'DELETE FROM review_ratings WHERE review_id=$1 AND user_id=$2',
        [reviewId, userId]
    );
}

async function updateReviewScore(client: PoolClient, reviewId: string, isPositive: boolean): Promise<number> {
    return isPositive ? incReviewScore(client, reviewId) : decReviewScore(client, reviewId);
}

async function incReviewScore(client: PoolClient, reviewId: string): Promise<number> {
    const res = await client.query<{ score: number }>(
        'UPDATE reviews SET score=score+1 WHERE review_id=$1 RETURNING score;',
        [reviewId]
    );

    return res.rows[0].score;
}

async function decReviewScore(client: PoolClient, reviewId: string): Promise<number> {
    const res = await client.query<{ score: number }>(
        'UPDATE reviews SET score=score-1 WHERE review_id=$1 RETURNING score;',
        [reviewId]
    );

    return res.rows[0].score;
}