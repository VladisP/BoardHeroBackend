export class Logger {
    static info(url: string): void {
        console.log(`URL: ${url}: OK`);
    }

    static error(url: string, error: Error): void {
        console.error(`URL: ${url}: ERROR`);
        console.error(error.stack);
    }
}