import { houseContentSchema, type HouseContent } from "@athena/shared";

export type CurriculumContentErrorCode =
  "unauthenticated" | "forbidden" | "not_found" | "network" | "invalid_response";
export class CurriculumContentError extends Error {
  constructor(
    public readonly code: CurriculumContentErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "CurriculumContentError";
  }
}
export interface HouseContentReadOptions {
  locale?: "en" | "es";
  signal?: AbortSignal;
}
export interface CurriculumHouseContentClient {
  getHouseContent(topicId: string, options?: HouseContentReadOptions): Promise<HouseContent>;
}
export class HttpHouseContentClient implements CurriculumHouseContentClient {
  constructor(
    private readonly options: {
      apiOrigin: string;
      getAccessToken: () => Promise<string | null>;
      fetch?: typeof fetch;
    },
  ) {}
  async getHouseContent(
    topicId: string,
    options: HouseContentReadOptions = {},
  ): Promise<HouseContent> {
    if (
      !topicId.trim() ||
      topicId.length > 200 ||
      (options.locale !== undefined && !["en", "es"].includes(options.locale))
    )
      throw new Error("Invalid material request");
    let token: string | null;
    try {
      token = await this.options.getAccessToken();
    } catch {
      token = null;
    }
    if (!token)
      throw new CurriculumContentError("unauthenticated", "Sign in to view course materials.");
    const path = `/api/topics/${encodeURIComponent(topicId)}/sources${options.locale ? `?locale=${options.locale}` : ""}`;
    let response: Response;
    try {
      response = await (this.options.fetch ?? fetch)(
        `${this.options.apiOrigin.replace(/\/$/, "")}${path}`,
        {
          method: "GET",
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal: options.signal,
        },
      );
    } catch (error) {
      if (options.signal?.aborted) throw error;
      throw new CurriculumContentError(
        "network",
        "Could not reach the curriculum service. Please try again.",
      );
    }
    if (response.status === 401)
      throw new CurriculumContentError(
        "unauthenticated",
        "Your session has expired. Please sign in again.",
      );
    if (response.status === 403)
      throw new CurriculumContentError(
        "forbidden",
        "You do not have access to this material, or it has not been published.",
      );
    if (response.status === 404)
      throw new CurriculumContentError("not_found", "This topic's materials could not be found.");
    if (!response.ok)
      throw new CurriculumContentError(
        "network",
        "Could not load course materials. Please try again.",
      );
    try {
      return houseContentSchema.parse(await response.json());
    } catch {
      throw new CurriculumContentError(
        "invalid_response",
        "The curriculum service returned unreadable content. Please try again.",
      );
    }
  }
}
