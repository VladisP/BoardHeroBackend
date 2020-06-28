import * as express from 'express';
import { gamesRouter } from '../services/games/http-handler';
import { userRouter } from '../services/user/http-handler';
import { reviewRouter } from '../services/review/http-handler';

export const router = express.Router();

router.use('/games/', gamesRouter);
router.use('/user/', userRouter);
router.use('/review/', reviewRouter);