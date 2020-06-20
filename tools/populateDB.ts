import { Client, QueryConfig } from 'pg';

async function performQuery(): Promise<void> {
    const client: Client = new Client();
    await client.connect();

    const query: QueryConfig = {
        text: 'INSERT INTO board_games(board_game_id, game_name, description, image_url, small_image_url) VALUES($1, $2, $3, $4, $5)',
        values: ['123e4567-e89b-12d3-a456-426655440000', 'kek', 'lol', 'url', 'url2']
    };

    try {
        await client.query(query);
    } finally {
        await client.end();
    }
}

performQuery().catch(console.error);