import { ServerConfig } from '../../config/config';
import { BoardGame, RawBoardGame, Tag } from './model';
import { Pool } from 'pg';

interface GameMap {
    [key: string]: BoardGame;
}

interface GameMechanicInt {
    board_game_id: string;
    mechanic_id: string;
    mechanic_name: string;
}

interface GameCategoryInt {
    board_game_id: string;
    category_id: string;
    category_name: string;
}

export async function getGames(): Promise<Array<BoardGame>> {
    const { pool } = ServerConfig.get();
    const [rawGames, gameMechs, gameCats] = await select(pool);
    const gameMap = createGameMap(rawGames);

    mergeGameMechanics(gameMap, gameMechs);
    mergeGameCategories(gameMap, gameCats);

    return Object.values(gameMap);
}

export async function getMechanics(): Promise<Array<Tag>> {
    const { pool } = ServerConfig.get();

    const res = await pool.query<Tag>(
        'SELECT mechanic_id AS id, mechanic_name AS name\n' +
        'FROM mechanics;'
    );

    return res.rows;
}

async function select(pool: Pool): Promise<[Array<RawBoardGame>, Array<GameMechanicInt>, Array<GameCategoryInt>]> {
    const [resGames, resGameMech, resGameCat] = await Promise.all([
        pool.query<RawBoardGame>(
            'SELECT board_game_id AS id, game_name AS name, year_published, min_players,\n' +
            '       max_players, min_playtime, max_playtime, min_age,\n' +
            '       description, image_url, small_image_url, rating\n' +
            'FROM board_games'
        ),
        pool.query<GameMechanicInt>(
            'SELECT a.board_game_id, a.mechanic_id, b.mechanic_name\n' +
            'FROM game_mechanic_int AS a\n' +
            'JOIN mechanics AS b ON a.mechanic_id = b.mechanic_id'
        ),
        pool.query<GameCategoryInt>(
            'SELECT a.board_game_id, a.category_id, b.category_name\n' +
            'FROM game_category_int AS a\n' +
            'JOIN categories AS b ON a.category_id = b.category_id'
        )
    ]);

    return [resGames.rows, resGameMech.rows, resGameCat.rows];
}

function createGameMap(rawGames: Array<RawBoardGame>): GameMap {
    return rawGames.reduce((map, game) => {
        map[game.id] = { ...game, mechanics: [], categories: [] };
        return map;
    }, {} as GameMap);
}

function mergeGameMechanics(gameMap: GameMap, gameMechs: Array<GameMechanicInt>): void {
    gameMechs.forEach(gameMech => {
        gameMap[gameMech.board_game_id].mechanics.push({
            id: gameMech.mechanic_id,
            name: gameMech.mechanic_name
        });
    });
}

function mergeGameCategories(gameMap: GameMap, gameCats: Array<GameCategoryInt>): void {
    gameCats.forEach(gameCat => {
        gameMap[gameCat.board_game_id].categories.push({
            id: gameCat.category_id,
            name: gameCat.category_name
        });
    });
}