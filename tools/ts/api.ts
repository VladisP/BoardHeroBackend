import { BGApiResponse, BoardGame, CategoriesResponse, MechanicsResponse, Tag } from './model';
import { getRequestConfig } from './config';
import axios from 'axios';

interface APIData {
    games: Array<BoardGame>;
    mechanics: Array<Tag>;
    categories: Array<Tag>;
}

export async function getDataFromAPI(): Promise<APIData> {
    console.log('getting config...');
    const params = getRequestConfig();

    console.log('getting data from BGA API...');
    const [gameResponse, mechanicResponse, categoriesResponse] = await Promise.all([
        axios.get<BGApiResponse>(
            'https://www.boardgameatlas.com/api/search',
            { params }
        ),
        axios.get<MechanicsResponse>(
            'https://www.boardgameatlas.com/api/game/mechanics',
            { params: { client_id: params.client_id } }
        ),
        axios.get<CategoriesResponse>(
            'https://www.boardgameatlas.com/api/game/categories',
            { params: { client_id: params.client_id } }
        )
    ]);

    return {
        games: gameResponse.data.games.map(game => new BoardGame(game)),
        mechanics: mechanicResponse.data.mechanics.map(rawMechanic => ({
            id: rawMechanic.id,
            name: rawMechanic.name
        })),
        categories: categoriesResponse.data.categories.map(rawCategory => ({
            id: rawCategory.id,
            name: rawCategory.name
        }))
    };
}