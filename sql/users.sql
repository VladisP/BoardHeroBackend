CREATE TABLE users
(
    user_id       uuid        NOT NULL PRIMARY KEY,
    user_name     varchar     NOT NULL UNIQUE,
    karma         integer     NOT NULL DEFAULT 0,
    created_at    timestamptz NOT NULL,
    info          text        NULL,
    email         varchar     NOT NULL UNIQUE,
    password_hash varchar     NOT NULL
);

CREATE TABLE favorite_game_records
(
    board_game_id varchar     NOT NULL REFERENCES board_games (board_game_id) ON UPDATE RESTRICT ON DELETE CASCADE,
    user_id       uuid        NOT NULL REFERENCES users (user_id) ON UPDATE RESTRICT ON DELETE CASCADE,
    created_at    timestamptz NOT NULL,
    PRIMARY KEY (board_game_id, user_id)
);