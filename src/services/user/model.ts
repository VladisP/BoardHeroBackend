export interface User {
    user_id: string;
    user_name: string;
    karma: number;
    created_at: Date;
    info: string;
    password_hash: string;
    favorite_games?: Array<FavoriteGameRecord>;
}

export interface FavoriteGameRecord {
    id: string;
    created_at: Date;
}