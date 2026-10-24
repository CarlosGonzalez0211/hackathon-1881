import type { HouseState, PlanetState } from "@athena/shared";
import { houseInteractionAnchors, renderingDefinition } from "../config";
import { createEngineContext, disposeEngineContext } from "../runtime/context";
import type { LegacyContext } from "../runtime/legacy-context";

export interface ProjectedHouse {
  slot: number;
  x: number;
  y: number;
  visible: boolean;
  distance: number;
}
export interface EngineStats {
  fps: number;
  drawCalls: number;
  triangles: number;
  planets: number;
}
export interface SurfaceOptions {
  state: PlanetState;
  signal?: AbortSignal;
  onHouseClick?: (house: HouseState) => void;
  onProjection?: (houses: ProjectedHouse[]) => void;
  onStats?: (stats: EngineStats) => void;
  onReady?: () => void;
}
export interface SurfaceHandle {
  update(state: PlanetState): void;
  setPaused(paused: boolean): void;
  setMuted(muted: boolean): void;
  dispose(): void;
  readonly resourceCounts: {
    listeners: number;
    timeouts: number;
    intervals: number;
    frames: number;
    workers: number;
  };
}

export async function createSurfaceEngine(
  host: HTMLElement,
  options: SurfaceOptions,
): Promise<SurfaceHandle> {
  const { scope, lifecycle } = await createEngineContext();
  let state = options.state;
  let disposed = false;
  let controller: LegacyContext | undefined;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    disposeEngineContext(scope, lifecycle);
    try {
      controller?.audioController?._controller?.dispose();
    } catch {
      // best-effort teardown
    }
    try {
      controller?.planetScene?.characters?.dispose();
    } catch {
      // best-effort teardown
    }
    for (const composer of Object.values(controller?.sceneComposers || {}) as LegacyContext[]) {
      try {
        composer.dispose();
      } catch {
        // best-effort teardown
      }
    }
    host.replaceChildren();
  };
  options.signal?.addEventListener("abort", dispose, { once: true });
  if (options.signal?.aborted) {
    dispose();
    throw new DOMException("Aborted", "AbortError");
  }
  try {
    scope.customEase("tweaked", "M0,0 C0.388,0 0.441,0.356 0.496,0.496 0.553,0.641 0.647,1 1,1");
    console.info("[Athena] initializing surface renderer");
    await scope.global$1.init({
      canvasCnt: host,
      interactionNode: null,
      relativePath: "",
      fingers: 2,
      audioContext: true,
      contextMenu: false,
      DPR: Math.min(window.devicePixelRatio, 1.25),
      adaptiveDPR: true,
      shadowMap: true,
      shadowMapType: scope.PCFSoftShadowMap,
    });
    if (disposed) throw new DOMException("Aborted", "AbortError");
    console.info("[Athena] surface renderer initialized");
    controller = Object.create(scope.mainController.prototype);
    Object.assign(controller!, {
      options: {},
      ready: scope.miscutils.deferred(),
      state: null,
      sceneComposers: {},
      currentScene: null,
      planetScene: null,
    });
    controller!.initGlobalPlane();
    controller!.audioController = new scope.audioController(controller);
    console.info("[Athena] loading surface scene");
    scope.events$1.emit("render_active", true);
    await controller!.initPresent();
    console.info("[Athena] surface scene ready");
    if (disposed) throw new DOMException("Aborted", "AbortError");
    const scene = controller!.planetScene;
    scene.anyStepInitiated = true;
    scene.characterInitialOptions.relativeCameraOffset.fromArray(
      renderingDefinition.camera.relativeOffset,
    );
    controller!.material.uniforms.uWipe1.value = 0;
    controller!.material.uniforms.uWipe2.value = 0;
    controller!.material.uniforms.uFlash.value = 0;
    scope.global$1.renderPass.scene.beforeRenderCbs.push(() => controller!.render());
    scene.characters.enable();
    // Growth is supplied by domain fixtures, never inferred from activity.
    scene.userData.planetState = state;
    const position = new scope.Vector3();
    const projected = new scope.Vector3();
    let nearest: number | undefined;
    let lastUi = 0;
    scene.beforeRenderCbs.push(() => {
      if (disposed) return;
      if (scope.renderInfo.time - lastUi < 0.08) return;
      lastUi = scope.renderInfo.time;
      const player = scene.characters.mesh._localObject;
      let min = Infinity;
      nearest = undefined;
      const points = houseInteractionAnchors.map((anchor) => {
        position.fromArray(anchor.position);
        const distance = position.distanceTo(player.position);
        if (distance < min && distance < (anchor.interaction?.radius || 2.2)) {
          min = distance;
          nearest = anchor.interaction?.slot;
        }
        projected
          .copy(position)
          .addScaledVector(position.clone().normalize(), 1.2)
          .project(scene.camera);
        return {
          slot: anchor.interaction!.slot!,
          x: ((projected.x + 1) * host.clientWidth) / 2,
          y: ((1 - projected.y) * host.clientHeight) / 2,
          visible: projected.z < 1 && position.dot(scene.camera.position) > 0,
          distance,
        };
      });
      options.onProjection?.(points);
      options.onStats?.({
        fps: scope.renderInfo.averageFPS || 0,
        drawCalls: scope.global$1.renderer.info.render.calls,
        triangles: scope.global$1.renderer.info.render.triangles,
        planets: 1,
      });
    });
    lifecycle.listen(window, "keydown", ((event: KeyboardEvent) => {
      if (event.code === "KeyE" && nearest !== undefined) {
        const house = state.houses.find((item) => item.slot === nearest);
        if (house) options.onHouseClick?.(house);
      }
    }) as EventListener);
    scope.events$1.emit("render_active", true);
    controller!.audioController.camera = scene.camera;
    options.onReady?.();
    return {
      update(next) {
        state = next;
        scene.userData.planetState = state;
      },
      setPaused(paused) {
        if (paused) scene.characters.disable();
        else scene.characters.enable();
      },
      setMuted(muted) {
        scope.events$1.emit("audio_mute_toggle", muted);
      },
      dispose,
      get resourceCounts() {
        return lifecycle.counts;
      },
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
