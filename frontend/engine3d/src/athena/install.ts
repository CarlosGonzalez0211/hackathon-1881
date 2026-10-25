/**
 * Athena system registry — the single hook point for swapping legacy subsystems
 * (avatar, NPCs, houses, terrain, orbit, toon shading, audio…) onto the Athena kit.
 *
 * Adding a system is ONE line in `src/athena/systems.ts`:
 *
 *   registerAthenaSystem("npcs", installAthenaNpcs);
 *
 * where `installAthenaNpcs(ctx)` patches the runtime through `ctx.scope` (prototype
 * overrides, like `runtime/configuration.ts` does) and may be async. Systems run once per
 * engine context, in registration order, after `configureRecoveredEngine` and before any
 * scene is built. A throwing system is logged and skipped; the legacy path stays intact.
 *
 * Systems should check `ctx.enabled` (engine option `athenaAssets`, and a manifest was
 * loaded) and resolve URLs through `ctx.resolve(...)`; never import npm `three` — use
 * `ctx.scope.<Class>`. Free per-engine resources with `ctx.onDispose(...)`.
 */
import {
  getAthenaManifest,
  isAthenaAssetsEnabled,
  resolveAthena,
  resolveForLoader,
} from "../assets/athena-manifest";
import type { AthenaRuntimeManifest } from "../assets/athena-manifest";
import { createAthenaGltfLoader } from "../loaders/athena-gltf-loader";
import type { AthenaGltfLoader } from "../loaders/athena-gltf-loader";
import {
  athenaPlacementOverrides,
  debugBounds,
  fitToBounds,
  snapToGround,
} from "../placement/athena-placement";
import { createAthenaToon } from "../materials/athena-toon-material";
import { ensureAthenaThreeClasses } from "../materials/three-shims";
import type { AthenaToon } from "../materials/athena-toon-material";
import type { LegacyContext } from "../runtime/legacy-context";
import type { EngineLifecycle } from "../runtime/lifecycle";

export interface AthenaInstallContext {
  /** The recovered runtime scope: every Three class (`scope.Mesh`, `scope.Box3`…). */
  readonly scope: LegacyContext;
  /** Meshopt/KTX2-aware GLB loader bound to this scope (cached per URL). */
  readonly gltf: AthenaGltfLoader;
  /** Loaded runtime manifest, or undefined when assets were not built / flag off. */
  readonly manifest: AthenaRuntimeManifest | undefined;
  /** `resolveAthena`: manifest key / legacy path / Athena source → built file. */
  readonly resolve: typeof resolveAthena;
  /** Loader-format-aware resolution used by the legacy loader wrappers. */
  readonly resolveForLoader: typeof resolveForLoader;
  /** `athenaAssets` option is on AND a manifest is loaded. */
  readonly enabled: boolean;
  /** Owns timers/listeners/frames/workers of this engine instance. */
  readonly lifecycle: EngineLifecycle;
  /** Shared toon + ink conversion (one gradient map and ink material per engine). */
  readonly toon: AthenaToon;
  readonly placement: {
    readonly overrides: typeof athenaPlacementOverrides;
    readonly fitToBounds: typeof fitToBounds;
    readonly snapToGround: typeof snapToGround;
    readonly debugBounds: typeof debugBounds;
  };
  /** Register teardown for this engine instance (runs in `disposeEngineContext`). */
  onDispose(callback: () => void): void;
}
export type AthenaSystem = (ctx: AthenaInstallContext) => void | Promise<void>;
/** What `installAthena` leaves on `scope.athena`. */
export interface AthenaInstallation extends AthenaInstallContext {
  /** Names of systems that installed without throwing. */
  readonly installed: readonly string[];
  dispose(): void;
}

const systems = new Map<string, AthenaSystem>();

/** Register (or replace, e.g. on HMR) a system by name. Order = first registration. */
export function registerAthenaSystem(name: string, system: AthenaSystem) {
  systems.set(name, system);
}
export function unregisterAthenaSystem(name: string) {
  systems.delete(name);
}
export function listAthenaSystems() {
  return [...systems.keys()];
}

/** Stand-in when the GLB loader cannot be created: every load rejects with the cause. */
function unavailableGltfLoader(cause: unknown): AthenaGltfLoader {
  const fail = () => Promise.reject(new Error("Athena GLB loader unavailable", { cause }));
  return { load: fail, loadSceneFromGlb: fail, loadGeometryFromGlb: fail, clear() {} };
}

/**
 * Build the install context and run every registered system once for this scope.
 * Called from `createEngineContext` right after `configureRecoveredEngine`.
 */
export async function installAthena(
  scope: LegacyContext,
  options: { lifecycle: EngineLifecycle; athenaAssets: boolean },
): Promise<AthenaInstallation> {
  if (scope.athena) return scope.athena as AthenaInstallation;
  const disposers: (() => void)[] = [];
  let gltf: AthenaGltfLoader;
  let gltfAvailable = true;
  try {
    gltf = createAthenaGltfLoader(scope);
  } catch (error) {
    // e.g. a recovered runtime without `scope.GLTFLoader`: keep the engine on legacy assets.
    console.warn("[Athena] GLB loader unavailable; Athena assets disabled", error);
    gltf = unavailableGltfLoader(error);
    gltfAvailable = false;
  }
  const installed: string[] = [];
  ensureAthenaThreeClasses(scope);
  const toon = createAthenaToon(scope);
  disposers.push(() => toon.dispose());
  const installation: AthenaInstallation = {
    scope,
    gltf,
    manifest: options.athenaAssets ? getAthenaManifest() : undefined,
    resolve: resolveAthena,
    resolveForLoader,
    enabled: gltfAvailable && options.athenaAssets && isAthenaAssetsEnabled(),
    lifecycle: options.lifecycle,
    toon,
    placement: { overrides: athenaPlacementOverrides, fitToBounds, snapToGround, debugBounds },
    onDispose: (callback) => disposers.push(callback),
    installed,
    dispose() {
      for (const callback of disposers.splice(0).reverse()) {
        try {
          callback();
        } catch {
          /* teardown continues */
        }
      }
      gltf.clear();
    },
  };
  scope.athena = installation;
  for (const [name, system] of systems) {
    try {
      await system(installation);
      installed.push(name);
    } catch (error) {
      console.error(`[Athena] system "${name}" failed; legacy path kept`, error);
    }
  }
  if (installed.length) console.info(`[Athena] systems installed: ${installed.join(", ")}`);
  return installation;
}
