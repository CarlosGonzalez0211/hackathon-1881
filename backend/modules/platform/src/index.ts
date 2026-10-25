/** Internal platform module (Subsystem 4): identity, authorization, events. Contracts are proposals. */
export { PlatformError, forbidden, notFound, unauthorized } from "./errors.js";
export {
  fixedClock,
  randomIdGenerator,
  sequentialIdGenerator,
  systemClock,
  type Clock,
  type IdGenerator,
} from "./clock.js";
export {
  InMemoryDomainEventStore,
  type DomainEventHandler,
  type DomainEventStore,
  type InMemoryDomainEventStoreOptions,
} from "./events.js";
export {
  AllowAllAuthorizationService,
  AllowAllAuthService,
  demoProfessorContext,
  type AuthorizationService,
  type AuthService,
} from "./auth.js";
export { RoleAuthorizationService } from "./authorization.js";
export { demoClass, InMemoryClassCatalog, type ClassCatalog } from "./classes.js";
export {
  DirectoryAuthService,
  InMemoryIdentityDirectory,
  StaticTokenVerifier,
  type IdentityDirectory,
  type InMemoryClass,
  type Memberships,
  type ProfileRecord,
  type TokenVerifier,
} from "./identity.js";
export { createPlatformServices, installPlatform, type PlatformServices } from "./services.js";
export { platformRoutes } from "./routes.js";
