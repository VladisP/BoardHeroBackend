export class Logger {
    static info(method: string, url: string): void {
        console.log(`${method} ${url}: OK`);
    }

    static error(method: string, url: string, error: Error): void {
        console.error(`${method} ${url}: ERROR`);
        console.error(error.stack);
    }
}