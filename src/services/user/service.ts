import { FavoriteGameRecord, User } from './model';
import { ServerConfig } from '../../config/config';
import { ErrorMessage } from '../../common/errorMessages';
import { v4 as uuidv4 } from 'uuid';
import { compare, genSalt, hash } from 'bcrypt';
import { getGameById } from '../games/service';
import { QueryResult } from 'pg';
import { getUserReviews } from '../review/service';

export async function createUser(username: string, password: string): Promise<User> {
    const { pool } = ServerConfig.get();
    const existRes = await getUserByName(username);

    if (existRes.rows.length > 0) {
        throw new Error(ErrorMessage.USER_EXIST);
    }

    const userID = uuidv4();
    const createdAt = new Date();
    const passwordHash = await hashPassword(password);

    const userRes = await pool.query<User>(
        'INSERT INTO users(user_id, user_name, created_at, password_hash) VALUES ($1, $2, $3, $4) RETURNING *;',
        [userID, username, createdAt, passwordHash]
    );

    return userRes.rows[0];
}

export async function authUser(username: string, password: string): Promise<User> {
    const userRes = await getUserByName(username);
    const user = userRes.rows[0];

    if (!user) {
        throw new Error(ErrorMessage.USER_DOESNT_EXIST);
    }

    const matchPassword = await compare(password, user.password_hash);

    if (!matchPassword) {
        throw new Error(ErrorMessage.INCORRECT_CREDENTIALS);
    }

    const favoriteGamesRes = await getFavoriteGames(user.user_id);
    const userReviews = await getUserReviews(user.user_id);

    user.favorite_games = favoriteGamesRes.rows;
    user.reviews = userReviews;

    return user;
}

export async function getUser(id: string): Promise<User> {
    const [userRes, favoriteGamesRes, userReviews] = await Promise.all([
        getUserById(id),
        getFavoriteGames(id),
        getUserReviews(id)
    ]);

    if (!userRes.rows[0]) {
        throw new Error(ErrorMessage.USER_DOESNT_EXIST);
    }

    const user = userRes.rows[0];
    user.favorite_games = favoriteGamesRes.rows;
    user.reviews = userReviews;

    return user;
}

export async function addFavoriteGame(userId: string, gameId: string): Promise<void> {
    const { pool } = ServerConfig.get();
    const game = await getGameById(gameId);

    if (!game) {
        throw new Error(ErrorMessage.GAME_DOESNT_EXIST);
    }

    await pool.query(
        'INSERT INTO favorite_game_records(board_game_id, user_id, created_at) VALUES ($1, $2, $3)',
        [gameId, userId, new Date()]
    );
}

export async function deleteFavoriteGame(userId: string, gameId: string): Promise<void> {
    const { pool } = ServerConfig.get();

    await pool.query(
        'DELETE FROM favorite_game_records ' +
        'WHERE board_game_id=$1 AND user_id=$2',
        [gameId, userId]
    );
}

async function hashPassword(password: string): Promise<string> {
    const salt = await genSalt();
    return await hash(password, salt);
}

async function getUserById(id: string): Promise<QueryResult<User>> {
    const { pool } = ServerConfig.get();

    return pool.query<User>(
        'SELECT * FROM users WHERE user_id=$1',
        [id]
    );
}

async function getUserByName(username: string): Promise<QueryResult<User>> {
    const { pool } = ServerConfig.get();

    return pool.query<User>(
        'SELECT * FROM users WHERE user_name=$1',
        [username]
    );
}

async function getFavoriteGames(userId: string): Promise<QueryResult<FavoriteGameRecord>> {
    const { pool } = ServerConfig.get();

    return pool.query<FavoriteGameRecord>(
        'SELECT board_game_id AS id, created_at FROM favorite_game_records WHERE user_id=$1',
        [userId]
    );
}