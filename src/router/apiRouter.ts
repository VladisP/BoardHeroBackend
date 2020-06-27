import * as express from 'express';
import { gamesRouter } from '../services/games/http-handler';
import { userRouter } from '../services/user/http-handler';

export const router = express.Router();

router.use('/games/', gamesRouter);
router.use('/user/', userRouter);