CREATE TABLE reviews
(
    review_id     uuid        NOT NULL PRIMARY KEY,
    board_game_id varchar     NOT NULL REFERENCES board_games (board_game_id) ON UPDATE RESTRICT ON DELETE CASCADE,
    user_id       uuid        NOT NULL REFERENCES users (user_id) ON UPDATE RESTRICT ON DELETE CASCADE,
    title         varchar     NOT NULL,
    description   text        NOT NULL,
    rating        integer     NOT NULL,
    created_at    timestamptz NOT NULL,
    score         integer     NOT NULL DEFAULT 0,
    UNIQUE (board_game_id, user_id),
    CONSTRAINT rating_values CHECK ( rating >= 0 and rating <= 10)
);

CREATE TABLE review_ratings
(
    review_id   uuid    NOT NULL REFERENCES reviews (review_id) ON UPDATE RESTRICT ON DELETE CASCADE,
    user_id     uuid    NOT NULL REFERENCES users (user_id) ON UPDATE RESTRICT ON DELETE CASCADE,
    is_positive boolean NOT NULL,
    PRIMARY KEY (review_id, user_id)
);