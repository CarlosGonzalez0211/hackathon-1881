import type { FastifyInstance } from "fastify";
import type { AuthContext } from "@athena/shared";
import {
  AllowAllAuthorizationService,
  AllowAllAuthService,
  type AuthorizationService,
  type AuthService,
} from "./auth.js";
import { randomIdGenerator, systemClock, type Clock, type IdGenerator } from "./clock.js";
import { InMemoryDomainEventStore, type DomainEventStore } from "./events.js";

/** Services every subsystem receives through `app.platform`. */
export interface PlatformServices {
  events: DomainEventStore;
  auth: AuthService;
  authorization: AuthorizationService;
  clock: Clock;
  ids: IdGenerator;
}

declare module "fastify" {
  interface FastifyInstance {
    platform: PlatformServices;
  }
  interface FastifyRequest {
    auth: AuthContext;
  }
}

export function createPlatformServices(
  overrides: Partial<PlatformServices> = {},
): PlatformServices {
  return {
    events: new InMemoryDomainEventStore(),
    auth: new AllowAllAuthService(),
    authorization: new AllowAllAuthorizationService(),
    clock: systemClock,
    ids: randomIdGenerator,
    ...overrides,
  };
}

/**
 * Decorates the root app so every encapsulated module plugin can read `app.platform` and
 * `request.auth`. Call once at the root, before registering module plugins.
 */
export function installPlatform(
  app: FastifyInstance,
  services = createPlatformServices(),
  /** Paths that never need a caller (health checks). CORS preflights are always skipped. */
  publicPaths: readonly string[] = ["/api/health"],
) {
  app.decorate("platform", services);
  app.decorateRequest("auth", null as unknown as AuthContext);
  app.addHook("onRequest", async (request) => {
    if (request.method === "OPTIONS") return;
    const path = request.url.split("?")[0] ?? request.url;
    if (publicPaths.includes(path)) return;
    const header = request.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
    request.auth = await services.auth.authenticate(token);
  });
  return services;
}
