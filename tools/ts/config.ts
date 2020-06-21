import { config } from 'dotenv';

interface RequestConfig {
    client_id: string,
    limit: number,
    order_by: string,
    fields: string
}

export function getRequestConfig(): RequestConfig {
    config();

    if (typeof process.env.BGA_CLIENT_ID !== 'string') {
        throw new Error('Please specify env var BGA_CLIENT_ID');
    }

    return {
        client_id: process.env.BGA_CLIENT_ID,
        limit: 100,
        order_by: 'popularity',
        fields: [
            'id',
            'name',
            'year_published',
            'min_players',
            'max_players',
            'min_playtime',
            'max_playtime',
            'min_age',
            'description',
            'description_preview',
            'thumb_url',
            'image_url',
            'mechanics',
            'categories'
        ].join(',')
    };
}