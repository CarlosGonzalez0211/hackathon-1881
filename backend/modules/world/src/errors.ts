/** Domain errors carry an HTTP status that the api error handler forwards. */
export class WorldError extends Error {
  constructor(
    message: string,
    readonly statusCode: 400 | 403 | 404,
  ) {
    super(message);
    this.name = "WorldError";
  }
}

export const notFound = (what: string, id: string) =>
  new WorldError(`${what} not found: ${id}`, 404);
export const forbidden = (message: string) => new WorldError(message, 403);
export const badRequest = (message: string) => new WorldError(message, 400);
