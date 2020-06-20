CREATE TABLE board_games
(
    board_game_id   uuid     NOT NULL PRIMARY KEY,
    game_name       varchar  NOT NULL UNIQUE,
    year_published  smallint NULL,
    min_players     smallint NULL,
    max_players     smallint NULL,
    min_playtime    smallint NULL,
    max_playtime    smallint NULL,
    min_age         smallint NULL,
    description     text     NOT NULL,
    image_url       varchar  NOT NULL,
    small_image_url varchar  NOT NULL,
    rating          real     NOT NULL DEFAULT 0,

    CONSTRAINT positive_year CHECK ( year_published > 0 ),
    CONSTRAINT non_negative_min_players CHECK ( min_players >= 0 ),
    CONSTRAINT max_and_min_players CHECK ( max_players >= min_players ),
    CONSTRAINT positive_min_playtime CHECK ( min_playtime > 0 ),
    CONSTRAINT max_and_min_playtime CHECK ( max_playtime >= min_playtime ),
    CONSTRAINT non_negative_min_age CHECK ( min_age >= 0 ),
    CONSTRAINT rating_values CHECK ( rating >= 0 and rating <= 10)
);

CREATE TABLE mechanics
(
    mechanic_id   uuid    NOT NULL PRIMARY KEY,
    mechanic_name varchar NOT NULL UNIQUE
);

CREATE TABLE categories
(
    category_id   uuid    NOT NULL PRIMARY KEY,
    category_name varchar NOT NULL UNIQUE
);

CREATE TABLE game_mechanic_int
(
    board_game_id uuid NOT NULL REFERENCES board_games (board_game_id),
    mechanic_id   uuid NOT NULL REFERENCES mechanics (mechanic_id),
    PRIMARY KEY (board_game_id, mechanic_id)
);

CREATE TABLE game_category_int
(
    board_game_id uuid NOT NULL REFERENCES board_games (board_game_id),
    category_id   uuid NOT NULL REFERENCES categories (category_id),
    PRIMARY KEY (board_game_id, category_id)
);
