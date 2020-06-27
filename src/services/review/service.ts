import { ServerConfig } from '../../config/config';
import { getGameById } from '../games/service';
import { ErrorMessage } from '../../common/errorMessages';
import { v4 as uuidv4 } from 'uuid';

export async function createReview(gameId: string, userId: string, title: string, description: string, rating: number): Promise<Review> {
    const { pool } = ServerConfig.get();
    const game = await getGameById(gameId);

    if (!game) {
        throw new Error(ErrorMessage.GAME_DOESNT_EXIST);
    }

    const review = await getReviewByIds(gameId, userId);

    if (review) {
        throw new Error(ErrorMessage.REVIEW_EXIST);
    }

    const reviewRes = await pool.query<Review>(
        'INSERT INTO reviews(review_id, board_game_id, user_id, title, description, rating, created_at) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;',
        [uuidv4(), gameId, userId, title, description, rating, new Date()]
    );

    return reviewRes.rows[0];
}

async function getReviewByIds(gameId: string, userId: string): Promise<Review> {
    const { pool } = ServerConfig.get();

    const reviewRes = await pool.query<Review>(
        'SELECT * FROM reviews WHERE board_game_id=$1 AND user_id=$2',
        [gameId, userId]
    );

    return reviewRes.rows[0];
}