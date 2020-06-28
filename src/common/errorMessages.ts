export enum ErrorMessage {
    USER_EXIST = 'A user with the same name already exists',
    USER_DOESNT_EXIST = 'A user with the same name does not exist',
    INVALID_BODY = 'Invalid body parameters',
    UNAUTHORIZED = 'Please log in',
    INCORRECT_CREDENTIALS = 'Incorrect username or password',
    GAME_DOESNT_EXIST = 'The requested board game does not exist',
    REVIEW_EXIST = 'The user has already written a review for this game',
    REVIEW_DOESNT_EXIST = 'The requested review does not exist'
}