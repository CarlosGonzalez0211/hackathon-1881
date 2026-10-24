import { EngineLifecycle } from "./lifecycle";
import type { LegacyContext } from "./legacy-context";
import { configureRecoveredEngine } from "./configuration";
import { loadAthenaManifest, setAthenaAssetsEnabled } from "../assets/athena-manifest";
import { installAthena } from "../athena/install";
import "../athena/systems";

export interface EngineContextOptions {
  /** Resolve assets through the Athena manifest (`/athena/`) before legacy. Default true. */
  athenaAssets?: boolean;
}

export async function createEngineContext(options: EngineContextOptions = {}) {
  const athenaAssets = options.athenaAssets ?? true;
  const lifecycle = new EngineLifecycle();
  const scope: LegacyContext = { __lifecycle: lifecycle };
  try {
    setAthenaAssetsEnabled(athenaAssets);
    if (athenaAssets) {
      try {
        const manifest = await loadAthenaManifest();
        console.info(
          `[Athena] asset manifest loaded (${Object.keys(manifest.entries).length} keys)`,
        );
      } catch (error) {
        // Assets not built (or offline): keep running on the legacy mount.
        console.warn("[Athena] asset manifest unavailable, using legacy assets", error);
      }
    }
    const { initializeExtracted } = await import("../extracted/index.js");
    initializeExtracted(scope);
    console.info("[Athena] recovered bindings initialized");
    if (!scope.client$1.capabilities.webgl2)
      throw new Error("WebGL2 no está disponible. Puedes utilizar la lista de temas.");
    configureRecoveredEngine(scope, { athenaAssets, lifecycle });
    console.info("[Athena] authoring configuration applied");
    // Registered Athena systems (src/athena/systems.ts) patch on top of the overrides above.
    await installAthena(scope, { lifecycle, athenaAssets });
    return { scope, lifecycle, athenaAssets };
  } catch (error) {
    lifecycle.dispose();
    throw error;
  }
}

export function disposeEngineContext(scope: LegacyContext, lifecycle: EngineLifecycle) {
  // Stop scheduling first; no callbacks may re-create resources during teardown.
  lifecycle.dispose();
  for (const callback of [
    () => scope.athena?.dispose(),
    () => scope.events$1?.emit("render_active", false),
    () => scope.global$1?.dispose({ renderer: true, input: true, audioContext: true }),
    () => scope.client$1?.dispose(),
    () => scope.t$1?.dispose?.(),
    () => scope.audioController$1?.dispose?.(),
  ]) {
    try {
      callback();
    } catch {
      /* teardown continues for every owned resource */
    }
  }
}
