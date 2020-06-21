CREATE TABLE forum_posts
(
    post_id       uuid        NOT NULL PRIMARY KEY,
    board_game_id varchar     NOT NULL REFERENCES board_games (board_game_id) ON UPDATE RESTRICT ON DELETE CASCADE,
    user_id       uuid        NOT NULL REFERENCES users (user_id) ON UPDATE RESTRICT ON DELETE CASCADE,
    post_title    varchar     NOT NULL,
    description   text        NOT NULL,
    score         integer     NOT NULL DEFAULT 0,
    created_at    timestamptz NOT NULL,
    UNIQUE (board_game_id, post_title)
);

CREATE TABLE post_ratings
(
    user_id     uuid    NOT NULL REFERENCES users (user_id) ON UPDATE RESTRICT ON DELETE CASCADE,
    post_id     uuid    NOT NULL REFERENCES forum_posts (post_id) ON UPDATE RESTRICT ON DELETE CASCADE,
    is_positive boolean NOT NULL,
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE favorite_post_records
(
    user_id    uuid        NOT NULL REFERENCES users (user_id) ON UPDATE RESTRICT ON DELETE CASCADE,
    post_id    uuid        NOT NULL REFERENCES forum_posts (post_id) ON UPDATE RESTRICT ON DELETE CASCADE,
    created_at timestamptz NOT NULL,
    PRIMARY KEY (user_id, post_id)
);