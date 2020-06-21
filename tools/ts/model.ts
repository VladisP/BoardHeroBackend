export interface BGApiResponse {
    games: Array<RawBoardGame>;
}

export interface MechanicsResponse {
    mechanics: Array<RawTag>;
}

export interface CategoriesResponse {
    categories: Array<RawTag>;
}

interface RawBoardGame {
    'id': string;
    'name': string;
    'year_published': number;
    'min_players': number;
    'max_players': number;
    'min_playtime': number;
    'max_playtime': number;
    'min_age': number;
    'description': string;
    'description_preview': string;
    'thumb_url': string;
    'image_url': string;
    'mechanics': Array<IdItem>;
    'categories': Array<IdItem>;
}

interface RawTag {
    id: string;
    name: string;
    url: string;
    checked: boolean;
}

export interface Tag {
    id: string;
    name: string;
}

interface IdItem {
    id: string;
}

export class BoardGame {
    id: string;
    name: string;
    yearPublished: number;
    minPlayers: number;
    maxPlayers: number;
    minPlaytime: number;
    maxPlaytime: number;
    minAge: number;
    description: string;
    imageUrl: string;
    smallImageUrl: string;
    rating: number;
    mechanics: Array<IdItem>;
    categories: Array<IdItem>;

    constructor({
        id,
        name,
        year_published,
        min_players,
        max_players,
        min_playtime,
        max_playtime,
        min_age,
        description_preview,
        thumb_url,
        image_url,
        mechanics,
        categories
    }: RawBoardGame,
    ) {
        this.id = id;
        this.name = name;
        this.yearPublished = year_published;
        this.minPlayers = min_players;
        this.maxPlayers = max_players;
        this.minPlaytime = min_playtime;
        this.maxPlaytime = max_playtime;
        this.minAge = min_age;
        this.description = description_preview;
        this.imageUrl = image_url;
        this.smallImageUrl = thumb_url;
        this.rating = 0;
        this.mechanics = mechanics;
        this.categories = categories;
    }
}