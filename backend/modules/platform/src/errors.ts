/** Domain errors carry an HTTP status that the api error handler forwards. */
export class PlatformError extends Error {
  constructor(
    message: string,
    readonly statusCode: 400 | 401 | 403 | 404,
  ) {
    super(message);
    this.name = "PlatformError";
  }
}

export const notFound = (what: string, id: string) =>
  new PlatformError(`${what} not found: ${id}`, 404);
export const forbidden = (message: string) => new PlatformError(message, 403);
export const unauthorized = (message: string) => new PlatformError(message, 401);
