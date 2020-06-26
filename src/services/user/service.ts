import { User } from './model';
import { ServerConfig } from '../../config/config';
import { ErrorMessage } from '../../common/errorMessages';
import { v4 as uuidv4 } from 'uuid';
import { genSalt, hash } from 'bcrypt';

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

async function hashPassword(password: string): Promise<string> {
    const salt = await genSalt();
    return await hash(password, salt);
}