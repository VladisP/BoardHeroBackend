CREATE TABLE forum_comments
(
    comment_id uuid        NOT NULL PRIMARY KEY,
    post_id    uuid        NOT NULL REFERENCES forum_posts (post_id) ON UPDATE RESTRICT ON DELETE CASCADE,
    user_id    uuid        NOT NULL REFERENCES users (user_id) ON UPDATE RESTRICT ON DELETE CASCADE,
    created_at timestamptz NOT NULL,
    text       text        NOT NULL,
    score      integer     NOT NULL DEFAULT 0,
    UNIQUE (post_id, user_id, created_at)
);

CREATE TABLE comment_ratings
(
    user_id     uuid    NOT NULL REFERENCES users (user_id) ON UPDATE RESTRICT ON DELETE CASCADE,
    comment_id  uuid    NOT NULL REFERENCES forum_comments (comment_id) ON UPDATE RESTRICT ON DELETE CASCADE,
    is_positive boolean NOT NULL,
    PRIMARY KEY (user_id, comment_id)
);