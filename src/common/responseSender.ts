import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { Logger } from './logger';

export enum StatusCode {
    OK = 200,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    INTERNAL_ERROR = 500
}

class Response {
    result: string;

    constructor(result: string) {
        this.result = result;
    }
}

class SuccessResponse extends Response {
    payload: unknown;

    constructor(payload: unknown) {
        super('OK');
        this.payload = payload;
    }
}

class ErrorResponse extends Response {
    error: string;

    constructor(error: string) {
        super('ERROR');
        this.error = error;
    }
}

export function successResponse(req: ExpressRequest, res: ExpressResponse, data: unknown): void {
    Logger.info(req.method, req.baseUrl + req.url);

    res.status(StatusCode.OK).json(new SuccessResponse(data));
}

export function errorResponse(req: ExpressRequest, res: ExpressResponse, code: number, e: Error): void {
    Logger.error(req.method, req.baseUrl + req.url, e);

    res.status(code).json(new ErrorResponse(e.message));
}