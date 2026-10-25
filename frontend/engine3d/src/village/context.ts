import {
  loadAthenaManifest,
  resolveAthena,
  setAthenaAssetsEnabled,
} from "../assets/athena-manifest";
import { installAthena } from "../athena/install";
import { EngineLifecycle } from "../runtime/lifecycle";
import type { LegacyContext } from "../runtime/legacy-context";

/** Reuse rendering primitives and asset tooling, without constructing or patching a legacy world. */
export async function createVillageContext() {
  const lifecycle = new EngineLifecycle();
  const scope: LegacyContext = { __lifecycle: lifecycle, athenaStandardPipeline: true };
  try {
    setAthenaAssetsEnabled(true);
    await loadAthenaManifest();
    const { initializeExtracted } = await import("../extracted/index.js");
    initializeExtracted(scope);
    const assets = await installAthena(scope, {
      lifecycle,
      athenaAssets: true,
      installLegacySystems: false,
    });
    if (!assets.enabled) throw new Error("No se pudieron cargar los recursos de Athena.");
    return {
      scope,
      lifecycle,
      assets,
      dispose() {
        lifecycle.dispose();
        assets.dispose();
        scope.client$1?.dispose();
        scope.t$1?.dispose?.();
      },
    };
  } catch (error) {
    lifecycle.dispose();
    scope.client$1?.dispose();
    throw error;
  }
}

/** Gesture-started Athena audio; buses remain independent of legacy scene controllers. */
export function createVillageAudio() {
  const sources = new Map<string, HTMLAudioElement>();
  let muted = true;
  const volumes = { music: 0.35, effects: 0.65 };
  const get = (key: string, loop: boolean) => {
    let audio = sources.get(key);
    if (!audio) {
      const url = resolveAthena(key)?.url;
      if (!url) return;
      audio = new Audio(url);
      audio.loop = loop;
      audio.preload = "none";
      sources.set(key, audio);
    }
    return audio;
  };
  const apply = () => {
    for (const [key, audio] of sources) {
      audio.muted = muted;
      audio.volume =
        key.includes("music/") || key.includes("ambiances/")
          ? volumes.music * 0.45
          : volumes.effects * 0.45;
      if (muted) audio.pause();
    }
  };
  return {
    setMuted(value: boolean) {
      muted = value;
      if (!muted) {
        get("audio/music/bgmusic-light.wav", true);
        get("audio/ambiances/forest.wav", true);
      }
      apply();
      if (!muted)
        for (const audio of sources.values()) if (audio.loop) void audio.play().catch(() => {});
    },
    setVolumes(next: { music?: number; effects?: number }) {
      if (next.music !== undefined) volumes.music = Math.max(0, Math.min(1, next.music));
      if (next.effects !== undefined) volumes.effects = Math.max(0, Math.min(1, next.effects));
      apply();
    },
    play(key: string) {
      if (muted) return;
      const audio = get(key, false);
      if (audio) {
        apply();
        audio.currentTime = 0;
        void audio.play().catch(() => {});
      }
    },
    dispose() {
      for (const audio of sources.values()) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
      sources.clear();
    },
  };
}
