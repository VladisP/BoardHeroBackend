import { ServerConfig } from '../../config/config';
import { BoardGame, RawBoardGame, Tag } from './model';
import { Pool, PoolClient } from 'pg';

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

interface Likes {
    likes_count: number;
}

interface Rating {
    rating: number;
}

export async function getGames(): Promise<Array<BoardGame>> {
    const { pool } = ServerConfig.get();
    const [rawGames, gameMechs, gameCats] = await select(pool);
    const gameMap = createGameMap(await mapToBoardGames(rawGames));

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

export async function getCategories(): Promise<Array<Tag>> {
    const { pool } = ServerConfig.get();

    const res = await pool.query<Tag>(
        'SELECT category_id AS id, category_name AS name\n' +
        'FROM categories;'
    );

    return res.rows;
}

export async function getGameById(id: string): Promise<RawBoardGame> {
    const { pool } = ServerConfig.get();

    const res = await pool.query<RawBoardGame>(
        'SELECT board_game_id AS id, game_name AS name, year_published, min_players,\n' +
        '       max_players, min_playtime, max_playtime, min_age,\n' +
        '       description, image_url, small_image_url, rating\n' +
        'FROM board_games WHERE board_game_id=$1',
        [id]
    );

    return res.rows[0];
}

export async function updateGameRating(client: PoolClient, id: string): Promise<number> {
    const res = await client.query<Rating>(
        'UPDATE board_games\n' +
        'SET rating = (SELECT (SELECT sum(rating) FROM reviews WHERE board_game_id = $1)::real /\n' +
        '                     (SELECT count(rating) FROM reviews WHERE board_game_id = $1))\n' +
        'WHERE board_game_id=$1 RETURNING rating;',
        [id]
    );

    return res.rows[0].rating;
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

async function mapToBoardGames(rawGames: Array<RawBoardGame>): Promise<Array<BoardGame>> {
    const games = [] as Array<BoardGame>;

    for (const rawGame of rawGames) {
        games.push({ ...rawGame, mechanics: [], categories: [], likes_count: await getLikesCount(rawGame.id) });
    }

    return games;
}

function createGameMap(rawGames: Array<BoardGame>): GameMap {
    return rawGames.reduce((map, game) => {
        map[game.id] = game;
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

async function getLikesCount(id: string): Promise<number> {
    const { pool } = ServerConfig.get();

    const likesRes = await pool.query<Likes>(
        'SELECT count(*) AS likes_count FROM favorite_game_records\n' +
        'WHERE board_game_id=$1',
        [id]
    );

    return likesRes.rows[0].likes_count;
}