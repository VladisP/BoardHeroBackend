import { IdReview } from '../review/model';

export interface User {
    user_id: string;
    user_name: string;
    karma: number;
    created_at: Date;
    info: string;
    password_hash: string;
    favorite_games?: Array<FavoriteGameRecord>;
    reviews?: Array<IdReview>;
    ratings?: Array<UserRating>;
}

export interface FavoriteGameRecord {
    id: string;
    created_at: Date;
}

export interface UserRating {
    review_id: string;
    is_positive: boolean;
}