export interface RawBoardGame {
    id: string;
    name: string;
    year_published: number;
    min_players: number;
    max_players: number;
    min_playtime: number;
    max_playtime: number;
    min_age: number;
    description: string;
    image_url: string;
    small_image_url: string;
    rating: number;
}

export interface BoardGame extends RawBoardGame {
    mechanics: Array<Tag>;
    categories: Array<Tag>;
    likes_count: number;
}

export interface Tag {
    id: string;
    name: string;
}