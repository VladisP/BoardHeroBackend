export interface Review {
    review_id: string;
    board_game_id: string;
    user_id: string;
    title: string;
    description: string;
    rating: number;
    created_at: Date;
    score: number;
}

export interface IdReview {
    id: string;
}

export interface ReviewRating {
    review_id: string;
    user_id: string;
    is_positive: boolean;
}