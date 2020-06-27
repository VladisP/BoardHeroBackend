import { ServerConfig } from '../../config/config';
import { getGameById, updateGameRating } from '../games/service';
import { ErrorMessage } from '../../common/errorMessages';
import { v4 as uuidv4 } from 'uuid';
import { UserReview } from '../user/model';
import { GameReviews } from '../games/model';

interface ReviewResponse {
    review: Review;
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

        const reviewRes = await client.query<Review>(
            'INSERT INTO reviews(review_id, board_game_id, user_id, title, description, rating, created_at) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;',
            [uuidv4(), gameId, userId, title, description, rating, new Date()]
        );

        const newRating = await updateGameRating(client, gameId);

        await client.query('COMMIT');

        return { review: reviewRes.rows[0], new_game_rating: newRating };
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

export async function getUserReviews(userId: string): Promise<Array<UserReview>> {
    const { pool } = ServerConfig.get();

    const reviewsRes = await pool.query<UserReview>(
        'SELECT review_id AS id FROM reviews WHERE user_id=$1',
        [userId]
    );

    return reviewsRes.rows;
}

export async function getGameReviews(gameId: string): Promise<Array<GameReviews>> {
    const { pool } = ServerConfig.get();

    const reviewsRes = await pool.query<GameReviews>(
        'SELECT review_id AS id FROM reviews WHERE board_game_id=$1',
        [gameId]
    );

    return reviewsRes.rows;
}

async function getReviewByIds(gameId: string, userId: string): Promise<Review> {
    const { pool } = ServerConfig.get();

    const reviewRes = await pool.query<Review>(
        'SELECT * FROM reviews WHERE board_game_id=$1 AND user_id=$2',
        [gameId, userId]
    );

    return reviewRes.rows[0];
}