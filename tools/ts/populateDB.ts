import { Pool, QueryConfig } from 'pg';
import { BoardGame, Tag } from './model';
import { getDataFromAPI } from './api';

async function createGameMechanicRelationship(pool: Pool, game: BoardGame): Promise<void> {
    for (const { id } of game.mechanics) {
        await pool.query({
            text: 'INSERT INTO game_mechanic_int(board_game_id, mechanic_id) VALUES($1, $2)',
            values: [game.id, id]
        });
    }
}

async function createGameCategoryRelationship(pool: Pool, game: BoardGame): Promise<void> {
    for (const { id } of game.categories) {
        await pool.query({
            text: 'INSERT INTO game_category_int(board_game_id, category_id) VALUES($1, $2)',
            values: [game.id, id]
        });
    }
}

async function insertGames(pool: Pool, games: Array<BoardGame>): Promise<void> {
    console.log('inserting games...');

    for (const game of games) {
        const query: QueryConfig = {
            text: 'INSERT INTO board_games(board_game_id, game_name, year_published, min_players, max_players, min_playtime, max_playtime, min_age, description, image_url, small_image_url, rating) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
            values: [
                game.id,
                game.name,
                game.yearPublished,
                game.minPlayers,
                game.maxPlayers,
                game.minPlaytime,
                game.maxPlaytime,
                game.minAge,
                game.description,
                game.imageUrl,
                game.smallImageUrl,
                game.rating
            ]
        };

        await pool.query(query);

        await Promise.all([
            createGameMechanicRelationship(pool, game),
            createGameCategoryRelationship(pool, game)
        ]);
    }
}

async function insertMechanics(pool: Pool, mechanics: Array<Tag>): Promise<void> {
    console.log('inserting mechanics...');

    for (const mechanic of mechanics) {
        const query: QueryConfig = {
            text: 'INSERT INTO mechanics(mechanic_id, mechanic_name) VALUES($1, $2)',
            values: [mechanic.id, mechanic.name]
        };

        await pool.query(query);
    }
}

async function insertCategories(pool: Pool, categories: Array<Tag>): Promise<void> {
    console.log('inserting categories...');

    for (const category of categories) {
        const query: QueryConfig = {
            text: 'INSERT INTO categories(category_id, category_name) VALUES($1, $2)',
            values: [category.id, category.name]
        };

        await pool.query(query);
    }
}

async function populateDB(): Promise<void> {
    const data = await getDataFromAPI();

    console.log('creating new pool...');
    const pool = new Pool();

    try {
        console.log('inserting data...');

        await Promise.all([
            insertMechanics(pool, data.mechanics),
            insertCategories(pool, data.categories)
        ]);

        await insertGames(pool, data.games);
    } finally {
        console.log('draining the pool...');
        await pool.end();
    }
}

populateDB().catch(console.error);