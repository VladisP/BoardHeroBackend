import { ServerConfig } from '../../config/config';
import { getGameById, updateGameRating } from '../games/service';
import { ErrorMessage } from '../../common/errorMessages';
import { v4 as uuidv4 } from 'uuid';
import { IdReview, Review } from './model';

interface ReviewResponse {
    review_id: string;
    new_game_rating: number;
}

export async function createReview(gameId: string, userId: string, title: string, description: string, rating: number): Promise<ReviewResponse> {
    const { pool } = ServerConfig.get();
    const client = await pool.connect();
    const game = await getGameById(gameId);

    if (!game) {
        throw new Error(ErrorMessage.GAME_DOESNT_EXIST);
    }

    const review = await getReviewByIds(gameId, userId);

    if (review) {
        throw new Error(ErrorMessage.REVIEW_EXIST);
    }

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

async function getReviewByIds(gameId: string, userId: string): Promise<IdReview> {
    const { pool } = ServerConfig.get();

    const reviewRes = await pool.query<IdReview>(
        'SELECT review_id AS id FROM reviews WHERE board_game_id=$1 AND user_id=$2',
        [gameId, userId]
    );

    return reviewRes.rows[0];
}