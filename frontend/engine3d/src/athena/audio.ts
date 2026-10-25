/**
 * Task 12: separate music / effects volumes over the legacy audio controller.
 *
 * Every source keeps the gain the legacy code asks for (including zone-driven ambiences),
 * multiplied by its bus volume (config/audio.ts `audioBusOf`). Files resolve to the Athena
 * OGGs through the loader wrapper in runtime/configuration.ts. The controller starts
 * muted, so nothing plays before the first gesture that unmutes it.
 */
import { audioBusOf, audioDefinition } from "../config/audio";
import type { AudioBus } from "../config/audio";
import type { LegacyContext } from "../runtime/legacy-context";
import type { AthenaInstallContext } from "./install";

export interface AthenaVolumes {
  readonly music: number;
  readonly effects: number;
}

const clamp = (value: number) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));

export function installAthenaAudio(ctx: AthenaInstallContext) {
  const { scope } = ctx;
  const proto = scope.audioController$1?.prototype;
  if (!proto) return;
  const volumes: Record<AudioBus, number> = { ...audioDefinition.volumes };
  /** controller → name → gain the legacy code last asked for. */
  const requested = new Map<LegacyContext, Map<string, number>>();
  const addAudio = proto.addAudio;
  const setAudioVolume = proto.setAudioVolume;
  const remember = (controller: LegacyContext, name: string, volume: number) => {
    let byName = requested.get(controller);
    if (!byName) requested.set(controller, (byName = new Map()));
    byName.set(name, volume);
  };
  if (addAudio)
    proto.addAudio = function (this: LegacyContext, options: LegacyContext = {}) {
      const name = String(options.name ?? "default");
      const volume = typeof options.volume === "number" ? options.volume : 1;
      remember(this, name, volume);
      return addAudio.call(this, { ...options, volume: volume * volumes[audioBusOf(name)] });
    };
  proto.setAudioVolume = function (this: LegacyContext, name = "default", volume = 1) {
    remember(this, name, volume);
    return setAudioVolume.call(this, name, volume * volumes[audioBusOf(name)]);
  };
  scope.athenaAudio = {
    get volumes(): AthenaVolumes {
      return { ...volumes };
    },
    setVolumes(next: Partial<AthenaVolumes>) {
      if (next.music !== undefined) volumes.music = clamp(next.music);
      if (next.effects !== undefined) volumes.effects = clamp(next.effects);
      for (const [controller, byName] of requested)
        for (const [name, volume] of byName)
          setAudioVolume.call(controller, name, volume * volumes[audioBusOf(name)]);
    },
  };
  ctx.onDispose(() => {
    if (addAudio) proto.addAudio = addAudio;
    proto.setAudioVolume = setAudioVolume;
    delete scope.athenaAudio;
  });
}
