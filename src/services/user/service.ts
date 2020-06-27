import { User } from './model';
import { ServerConfig } from '../../config/config';
import { ErrorMessage } from '../../common/errorMessages';
import { v4 as uuidv4 } from 'uuid';
import { genSalt, hash, compare } from 'bcrypt';

export async function createUser(username: string, password: string): Promise<User> {
    const { pool } = ServerConfig.get();

    const existRes = await pool.query(
        'SELECT * FROM users WHERE user_name=$1',
        [username]
    );

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
    const { pool } = ServerConfig.get();

    const existRes = await pool.query<User>(
        'SELECT * FROM users WHERE user_name=$1',
        [username]
    );

    const user = existRes.rows[0];

    if (!user) {
        throw new Error(ErrorMessage.USER_DOESNT_EXIST);
    }

    const matchPassword = await compare(password, user.password_hash);

    if (!matchPassword) {
        throw new Error(ErrorMessage.INCORRECT_CREDENTIALS);
    }

    return user;
}

export async function getUser(id: string): Promise<User> {
    const { pool } = ServerConfig.get();

    const userRes = await pool.query<User>(
        'SELECT * FROM users WHERE user_id=$1',
        [id]
    );

    return userRes.rows[0];
}

async function hashPassword(password: string): Promise<string> {
    const salt = await genSalt();
    return await hash(password, salt);
}