import * as express from 'express';
import { gamesRouter } from '../services/games/http-handler';

export const router = express.Router();

router.use('/games/', gamesRouter);