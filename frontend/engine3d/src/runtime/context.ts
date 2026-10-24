import { EngineLifecycle } from "./lifecycle";
import type { LegacyContext } from "./legacy-context";
import { configureRecoveredEngine } from "./configuration";

export async function createEngineContext() {
  const lifecycle = new EngineLifecycle();
  const scope: LegacyContext = { __lifecycle: lifecycle };
  try {
    const { initializeExtracted } = await import("../extracted/index.js");
    initializeExtracted(scope);
    console.info("[Athena] recovered bindings initialized");
    if (!scope.client$1.capabilities.webgl2)
      throw new Error("WebGL2 no está disponible. Puedes utilizar la lista de temas.");
    configureRecoveredEngine(scope);
    console.info("[Athena] authoring configuration applied");
    return { scope, lifecycle };
  } catch (error) {
    lifecycle.dispose();
    throw error;
  }
}

export function disposeEngineContext(scope: LegacyContext, lifecycle: EngineLifecycle) {
  // Stop scheduling first; no callbacks may re-create resources during teardown.
  lifecycle.dispose();
  for (const callback of [
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
