import type { PlanetState, QuestState } from "@athena/shared";
import { ClipPlayer, loadAthenaModel, graftByNodeName, finishModel } from "../athena/models";
import { avatarOutfitSources } from "../assets/athena-keys.mjs";
import { celebrationModel } from "../athena/celebrations";
import type { SurfaceOptions, SurfaceHandle } from "../scenes/surface";
import type { LegacyContext } from "../runtime/legacy-context";
import { createVillageContext, createVillageAudio } from "./context";
import { buildVillage, orient, disposeScene } from "./scene";
import { interactionTarget } from "./interaction";
import { SphericalWalker } from "./walker";
import { createAtmosphere } from "./atmosphere";
import { createLuminousGrade, type LuminousGrade } from "./grade";
import { detectTier, sunDirection, LUMINOUS } from "./light";
import {
  add,
  mul,
  tangent,
  arcDistance,
  plots,
  doorDirection,
  surfacePoint,
  cross,
  RADIUS,
  norm,
  canOccupy,
  advance,
  WATER_LEVEL,
  waterDepth,
} from "./layout";

const isEditing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  !!target.closest("input,textarea,select,[contenteditable=true],[role=dialog]");

export async function createSurfaceEngine(
  host: HTMLElement,
  options: SurfaceOptions,
): Promise<SurfaceHandle> {
  const context = await createVillageContext();
  const { scope: s, lifecycle, assets } = context;
  const scene = new s.Scene();
  const atmosphere = createAtmosphere(assets, scene);
  scene.fog = new s.Fog(LUMINOUS.haze, 30, 105);
  const tier = detectTier();
  const camera = new s.PerspectiveCamera(50, 1, 0.08, 260);
  const audio = createVillageAudio();
  let renderer: LegacyContext,
    grade: LuminousGrade | undefined,
    village: Awaited<ReturnType<typeof buildVillage>> | undefined;
  let avatarPlayer: ClipPlayer | undefined;
  let state = options.state,
    quests: QuestState[] = [],
    paused = false,
    disposed = false,
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let overview = false,
    focusSlot: number | undefined;
  const rewards: { root: LegacyContext; elapsed: number }[] = [];
  const keys = new Set<string>();
  let pointer: { id: number; x: number; y: number } | undefined;
  let stick = { x: 0, y: 0 };
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    options.signal?.removeEventListener("abort", cleanup);
    lifecycle.dispose();
    audio.dispose();
    avatarPlayer?.dispose();
    disposeScene(scene);
    village?.dispose();
    grade?.dispose();
    renderer?.dispose();
    renderer?.forceContextLoss();
    context.dispose();
    host.replaceChildren();
  };
  options.signal?.addEventListener("abort", cleanup, { once: true });
  try {
    if (options.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    renderer = new s.WebGLRenderer({
      // Multisampling lives in the HDR composer; the default framebuffer only receives the grade.
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, tier === "high" ? 1.5 : 1));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = s.PCFSoftShadowMap;
    renderer.outputColorSpace = s.SRGBColorSpace;
    renderer.toneMapping = s.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute(
      "aria-label",
      "Planeta de Athena. Usa WASD o las flechas para caminar, Espacio para saltar, E para interactuar y V para ver el planeta.",
    );
    host.appendChild(renderer.domElement);
    // Painterly materials add their own radial sky/ground fill; this only lifts deep shade.
    const ambient = new s.AmbientLight(LUMINOUS.sky, 0.45);
    scene.add(ambient);
    const sun = new s.DirectionalLight(LUMINOUS.sun, LUMINOUS.sunIntensity);
    sun.castShadow = true;
    sun.shadow.mapSize.set(tier === "high" ? 2048 : 1024, tier === "high" ? 2048 : 1024);
    sun.shadow.radius = 4;
    Object.assign(sun.shadow.camera, {
      left: -22,
      right: 22,
      top: 22,
      bottom: -22,
      near: 0.1,
      far: 130,
    });
    sun.shadow.bias = -0.001;
    sun.shadow.normalBias = 0.045;
    scene.add(sun, sun.target);
    const fill = new s.DirectionalLight("#9fc4e6", 0.5);
    scene.add(fill, fill.target);
    const resize = () => {
      const width = Math.max(1, host.clientWidth),
        height = Math.max(1, host.clientHeight);
      renderer!.setSize(width, height);
      grade?.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    grade = createLuminousGrade(s, renderer, scene, camera, tier);
    if (grade.composed) {
      // The depth haze carries aerial perspective; scene fog only softens the far edge.
      scene.fog.near = 120;
      scene.fog.far = 260;
    }
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    assets.onDispose(() => observer.disconnect());
    village = await buildVillage(assets, state);
    if (disposed) {
      disposeScene(village.root);
      village.dispose();
      throw new DOMException("Aborted", "AbortError");
    }
    scene.add(village.root);
    village.setReducedMotion(reduced);
    const walker = new SphericalWalker(village.obstacles, village.walkingRadius);
    const avatar = await loadAthenaModel(assets, "slot:avatar/base", { toon: false, merge: false });
    const parts = await Promise.all(
      avatarOutfitSources().map((key) =>
        loadAthenaModel(assets, key, { toon: false, merge: false }),
      ),
    );
    if (disposed) throw new DOMException("Aborted", "AbortError");
    for (const part of parts) graftByNodeName(s, avatar.root, part.root);
    finishModel(assets, avatar);
    const avatarRoot = new s.Group();
    avatarRoot.name = "athena-student";
    avatarRoot.add(avatar.root);
    scene.add(avatarRoot);
    avatarPlayer = new ClipPlayer(s, avatar.root, avatar.animations);
    avatarPlayer.play("idle");
    const clearInput = () => {
      keys.clear();
      pointer = undefined;
      stick = { x: 0, y: 0 };
    };
    let nearest: number | undefined,
      nearNpc: string | undefined,
      focused: number | null = null;
    const currentInteraction = () => interactionTarget(walker.up, state.houses, village!.actors);
    const interact = () => {
      if (paused) return;
      // Resolve on input, so fast movement cannot use an old NPC target from the HUD.
      const target = currentInteraction();
      if (target?.kind === "house") {
        const house = state.houses.find((item) => item.slot === target.slot);
        if (house) {
          options.onEvent?.({ type: "house_activate", slot: target.slot });
          options.onHouseClick?.(house);
          audio.play("audio/ui/open-panel-a.wav");
        }
      } else if (target?.kind === "npc") {
        options.onEvent?.({ type: "npc_activate", npcId: target.id });
        audio.play("audio/ui/click-a.wav");
      }
    };
    lifecycle.listen(window, "keydown", ((event: KeyboardEvent) => {
      if (paused || isEditing(event.target) || event.ctrlKey || event.metaKey || event.altKey)
        return;
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code))
        event.preventDefault();
      keys.add(event.code);
      if (event.repeat) return;
      if (event.code === "Space") {
        walker.jump();
        audio.play("audio/character/jump-start.wav");
      }
      if (event.code === "KeyE") interact();
      if (event.code === "KeyV") {
        overview = !overview;
        options.onOverviewChange?.(overview);
      }
    }) as EventListener);
    lifecycle.listen(window, "keyup", ((event: KeyboardEvent) => {
      keys.delete(event.code);
    }) as EventListener);
    lifecycle.listen(window, "blur", clearInput);
    lifecycle.listen(document, "visibilitychange", clearInput);
    lifecycle.listen(renderer.domElement, "pointerdown", ((event: PointerEvent) => {
      if (paused || event.button !== 0) return;
      renderer!.domElement.focus({ preventScroll: true });
      renderer!.domElement.setPointerCapture(event.pointerId);
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    }) as EventListener);
    lifecycle.listen(renderer.domElement, "pointermove", ((event: PointerEvent) => {
      if (pointer?.id !== event.pointerId || paused) return;
      stick = {
        x: Math.max(-1, Math.min(1, (event.clientX - pointer.x) / 65)),
        y: Math.max(-1, Math.min(1, (pointer.y - event.clientY) / 65)),
      };
    }) as EventListener);
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
      lifecycle.listen(renderer.domElement, type, clearInput);
    const controls = document.createElement("div");
    controls.className = "village-touch-controls";
    for (const [label, action] of [
      ["Saltar", () => walker.jump()],
      ["Interactuar", interact],
    ] as const) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      lifecycle.listen(button, "click", () => {
        if (!paused) action();
      });
      controls.appendChild(button);
    }
    host.appendChild(controls);
    const hint = document.createElement("div");
    hint.className = "village-interaction-hint";
    hint.setAttribute("aria-live", "polite");
    host.appendChild(hint);
    const point = new s.Vector3(),
      targetCamera = new s.Vector3(),
      targetLook = new s.Vector3(),
      smoothedLook = new s.Vector3();
    const cameraRay = new s.Raycaster(),
      cameraAnchor = new s.Vector3(),
      cameraVector = new s.Vector3();
    let previous = performance.now(),
      uiAt = 0,
      frames = 0,
      statsAt = previous,
      fps = 60,
      slowSince = 0,
      footstepsAt = 0;
    let cameraReady = false;
    const render = (now: number) => {
      if (disposed) return;
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      if (!paused) {
        const x =
          Number(keys.has("KeyD") || keys.has("ArrowRight")) -
          Number(keys.has("KeyA") || keys.has("ArrowLeft")) +
          stick.x;
        const y =
          Number(keys.has("KeyW") || keys.has("ArrowUp")) -
          Number(keys.has("KeyS") || keys.has("ArrowDown")) +
          stick.y;
        walker.step(dt, x, y, keys.has("ShiftLeft") || keys.has("ShiftRight"));
        avatarRoot.position.set(...walker.position);
        orient(s, avatarRoot, walker.up, walker.facing);
        const clip =
          walker.altitude > 0.05
            ? avatarPlayer!.has("air")
              ? "air"
              : "idle"
            : walker.moving
              ? walker.sprinting
                ? "sprint"
                : "walk"
              : "idle";
        avatarPlayer!.play(clip);
        avatarPlayer!.update(dt);

        if (
          walker.moving &&
          !walker.altitude &&
          now - footstepsAt > (walker.sprinting ? 280 : 430)
        ) {
          footstepsAt = now;
          audio.play("audio/character/footsteps.wav");
        }
        for (const actor of village!.actors) {
          const before = actor.up;
          const nearby = arcDistance(walker.up, actor.up) < 2.6;
          if (actor.id === "lumen") {
            const house =
              [...state.houses]
                .sort((a, b) => a.slot - b.slot)
                .find((h) => h.status === "available") ??
              state.houses.find((h) => h.status === "in_progress");
            if (house && plots[house.slot]) {
              const plot = plots[house.slot]!;
              const candidate = advance(
                doorDirection(house.slot),
                cross(plot.forward, plot.up),
                1.3,
              ).up;
              if (canOccupy(candidate, village!.obstacles, 0.25)) actor.up = candidate;
            }
          } else if (actor.patrol && !reduced && !nearby) {
            const travel = actor.travel + dt * 0.8 * actor.travelSign;
            const candidate = advance(actor.home, actor.forward, travel).up;
            if (
              Math.abs(travel) <= 3 &&
              canOccupy(candidate, village!.obstacles, 0.4) &&
              !village!.actors.some(
                (other) => other !== actor && arcDistance(other.up, candidate) < 1,
              )
            ) {
              actor.travel = travel;
              actor.up = candidate;
            } else actor.travelSign *= -1;
          }
          const step = arcDistance(before, actor.up);
          const moved = step > 0.0001;
          actor.cloth?.tick(dt, now / 1000, dt > 0 ? step / dt : 0, 0, reduced);
          const close = arcDistance(walker.up, actor.up) < 2.6;
          actor.root.position.set(...surfacePoint(actor.up));
          orient(
            s,
            actor.root,
            actor.up,
            close ? tangent(walker.up, actor.up) : mul(actor.forward, actor.travelSign),
          );
          actor.player.play(
            close && actor.player.has("talk")
              ? "talk"
              : moved && actor.player.has("walk")
                ? "walk"
                : "idle",
          );
          actor.player.update(dt);
        }
        village!.tick(dt, now / 1000, (slot) =>
          options.onEvent?.({ type: "house_transition_played", slot }),
        );
      }
      const ahead =
        focusSlot !== undefined && plots[focusSlot]
          ? tangent(plots[focusSlot]!.up, walker.up)
          : walker.forward;
      targetCamera.set(
        ...add(
          walker.position,
          add(mul(walker.up, overview ? 48 : 1.55), mul(ahead, overview ? -25 : -3.5)),
        ),
      );
      targetLook.set(
        ...(overview
          ? [0, 0, 0]
          : add(walker.position, add(mul(walker.up, 1.12), mul(ahead, 6.0)))),
      );
      if (!overview) {
        // Pull forward before a wall can enter the camera, then stay above the sampled terrain.
        cameraAnchor.set(...add(walker.position, mul(walker.up, 1.6)));
        cameraVector.copy(targetCamera).sub(cameraAnchor);
        cameraRay.set(cameraAnchor, cameraVector.clone().normalize());
        cameraRay.far = cameraVector.length();
        village!.root.updateMatrixWorld(true);
        const hit = cameraRay
          .intersectObjects(village!.cameraObstacles, true)
          .find((hit: LegacyContext) => !hit.object.userData.athenaInk);
        if (hit)
          targetCamera
            .copy(cameraAnchor)
            .addScaledVector(cameraRay.ray.direction, Math.max(0.15, hit.distance - 0.3));
        const up = norm([targetCamera.x, targetCamera.y, targetCamera.z]);
        const minimumRadius =
          Math.max(village!.walkingRadius(up), waterDepth(up) > 0.1 ? WATER_LEVEL : 0) + 0.45;
        if (targetCamera.length() < minimumRadius) targetCamera.set(...mul(up, minimumRadius));
      }
      const easing = cameraReady ? 1 - Math.exp(-dt * (reduced ? 18 : 6)) : 1;
      camera.position.lerp(targetCamera, easing);
      if (!overview) {
        // Recheck the interpolated position so smoothing cannot take a shortcut through a wall.
        cameraVector.copy(camera.position).sub(cameraAnchor);
        cameraRay.set(cameraAnchor, cameraVector.clone().normalize());
        cameraRay.far = cameraVector.length();
        const hit = cameraRay
          .intersectObjects(village!.cameraObstacles, true)
          .find((hit: LegacyContext) => !hit.object.userData.athenaInk);
        if (hit)
          camera.position
            .copy(cameraAnchor)
            .addScaledVector(cameraRay.ray.direction, Math.max(0.15, hit.distance - 0.3));
        const up = norm([camera.position.x, camera.position.y, camera.position.z]);
        const minimumRadius =
          Math.max(village!.walkingRadius(up), waterDepth(up) > 0.1 ? WATER_LEVEL : 0) + 0.45;
        if (camera.position.length() < minimumRadius)
          camera.position.set(...mul(up, minimumRadius));
      }
      smoothedLook.lerp(targetLook, easing);
      camera.up.set(...walker.up);
      camera.lookAt(smoothedLook);
      cameraReady = true;
      const sunward = sunDirection(walker.up, walker.forward);
      sun.position.copy(avatarRoot.position).add(new s.Vector3(...mul(sunward, 40)));
      assets.toon.lighting?.uAthenaSun.value.set(...sunward);
      sun.target.position.copy(avatarRoot.position);
      sun.target.updateMatrixWorld();
      fill.position
        .copy(avatarRoot.position)
        .add(new s.Vector3(...add(mul(walker.up, 12), mul(walker.forward, 18))));
      fill.target.position.copy(avatarRoot.position);
      fill.target.updateMatrixWorld();
      scene.fog.near = overview ? 140 : grade!.composed ? 120 : 30;
      scene.fog.far = overview ? 260 : grade!.composed ? 260 : 105;
      atmosphere.tick(camera, walker.up, walker.forward, now / 1000, reduced, overview);
      for (let i = rewards.length - 1; i >= 0; i--) {
        const reward = rewards[i]!;
        if (!paused) reward.elapsed += dt;
        reward.root.position.set(
          ...add(walker.position, mul(walker.up, 2.4 + (reduced ? 0 : reward.elapsed * 0.18))),
        );
        orient(s, reward.root, walker.up, walker.forward);
        if (reward.elapsed > 3.5) {
          reward.root.removeFromParent();
          rewards.splice(i, 1);
        }
      }
      camera.updateMatrixWorld();
      grade!.tick(camera, sunward, overview);
      grade!.render(dt);
      frames++;
      if (now - statsAt > 1000) {
        fps = (frames * 1000) / (now - statsAt);
        // Sustained low frame rate: shed god rays and deep bloom, then resolution.
        if (fps < 42 && !document.hidden) {
          slowSince ||= now;
          if (now - slowSince > 3500) {
            slowSince = 0;
            if (grade!.tier === "high") grade!.downgrade();
            else if (renderer!.getPixelRatio() > 1) {
              renderer!.setPixelRatio(1);
              resize();
            }
          }
        } else slowSince = 0;
        frames = 0;
        statsAt = now;
        options.onStats?.({
          fps,
          drawCalls: renderer!.info.render.calls,
          triangles: renderer!.info.render.triangles,
          planets: 1,
        });
      }
      // HTML anchors use the exact camera that rendered this frame, before the
      // browser paints. No React state queue or low-frequency UI timer in this path.
      camera.updateMatrixWorld();
      const points = state.houses
        .filter((h) => plots[h.slot])
        .map((house) => {
          const distance = arcDistance(walker.up, doorDirection(house.slot));
          const roof = village!.roof(house.slot);
          point.set(...roof).project(camera);
          const cameraDirection = camera.position.clone().normalize();
          const visible =
            point.z > -1 &&
            point.z < 1 &&
            point.x >= -1.1 &&
            point.x <= 1.1 &&
            point.y >= -1.1 &&
            point.y <= 1.1 &&
            cameraDirection.dot(new s.Vector3(...plots[house.slot]!.up)) >
              RADIUS / camera.position.length() - 0.08;
          return {
            slot: house.slot,
            x: ((point.x + 1) * host.clientWidth) / 2,
            y: ((1 - point.y) * host.clientHeight) / 2,
            visible,
            distance,
            inReach: distance < 2.6 && !paused,
          };
        });
      options.onProjection?.(points);
      if (now - uiAt > 120) {
        uiAt = now;
        const target = currentInteraction();
        nearest = target?.kind === "house" ? target.slot : undefined;
        nearNpc = target?.kind === "npc" ? target.id : undefined;
        const focus = nearest ?? null;
        if (focus !== focused) {
          focused = focus;
          options.onEvent?.({ type: "house_focus", slot: focus });
        }
        const npcName = village!.actors.find((actor) => actor.id === nearNpc)?.name;
        const house = state.houses.find((item) => item.slot === nearest);
        const text =
          paused || overview
            ? ""
            : house
              ? `E \u00b7 Entrar a ${house.title}`
              : npcName
                ? `E \u00b7 Hablar con ${npcName}`
                : "";
        if (hint.textContent !== text) hint.textContent = text;
        hint.hidden = !text;
      }
      lifecycle.requestAnimationFrame(render);
    };
    lifecycle.requestAnimationFrame(render);
    options.onReady?.();
    const update = (next: PlanetState) => {
      state = next;
      void village!
        .update(next)
        .catch((error) => console.error("[Athena] house update failed", error));
    };
    const celebrate = (key: string) => {
      void loadAthenaModel(assets, key)
        .then((model) => {
          if (disposed) return;
          const root = new s.Group();
          root.add(model.root);
          scene.add(root);
          rewards.push({ root, elapsed: 0 });
          audio.play("audio/ui/understanding-shown.wav");
        })
        .catch((error) => console.warn("[Athena] celebration unavailable", error));
    };
    return {
      update,
      updatePlanet: update,
      updateQuests(next) {
        quests = next;
      },
      get quests() {
        return quests;
      },
      setPaused(value) {
        paused = value;
        clearInput();
        controls.hidden = value;
      },
      setMuted: audio.setMuted,
      setVolumes: audio.setVolumes,
      setOverview(value) {
        overview = value;
      },
      focusHouse(slot) {
        if (plots[slot]) {
          focusSlot = slot;
          lifecycle.setTimeout(() => {
            focusSlot = undefined;
          }, 3500);
        }
      },
      showAchievement(achievement) {
        celebrate(celebrationModel("achievement", achievement.code));
      },
      showEasterEgg() {
        celebrate(celebrationModel("easter-egg"));
      },
      setAccessibility(settings) {
        reduced = settings.reducedMotion;
        village!.setReducedMotion(reduced);
        audio.setVolumes({ music: settings.musicVolume, effects: settings.sfxVolume });
      },
      dispose: cleanup,
      get resourceCounts() {
        return lifecycle.counts;
      },
    };
  } catch (error) {
    cleanup();
    throw error;
  }
}
