import { assetCatalog, assetById } from "../assets/catalog";
import {
  avatarDefinition,
  defaultAvatarAccessories,
  emoteDefinitions,
  npcDefinitions,
  renderingDefinition,
  worldDefinition,
} from "../config";
import type { LegacyContext } from "./legacy-context";

/** Bind authoring data to the recovered implementation, before a scene is built. */
export function configureRecoveredEngine(scope: LegacyContext) {
  const byOriginalPath = new Map(assetCatalog.map((asset) => [asset.id, asset]));
  const resolve = (family: string, relative: string) => {
    const normalized = relative.replace(/^(\.\/|\/)+/, "");
    const id = `${family}.${normalized.replaceAll("/", ".")}`;
    const asset = byOriginalPath.get(id);
    return asset ? asset.path.replace(new RegExp(`^${family}/`), "") : relative;
  };
  const loadGeometry = scope.geometryLoader.load.bind(scope.geometryLoader);
  scope.geometryLoader.load = (relative: string, ...args: unknown[]) =>
    loadGeometry(resolve("geometries", relative), ...args);
  const loadTexture = scope.textureLoader.load.bind(scope.textureLoader);
  scope.textureLoader.load = (relative: string, ...args: unknown[]) =>
    loadTexture(resolve("images", relative), ...args);
  const loadAudio = scope.audiobufferLoader?._initLoad.bind(scope.audiobufferLoader);
  if (loadAudio)
    scope.audiobufferLoader._initLoad = (relative: string, ...args: unknown[]) =>
      loadAudio(resolve("audio", relative), ...args);

  scope.client$1.localStorage.modelFiles = [...defaultAvatarAccessories];
  scope.DEFAULT_FILES.animationFiles = avatarDefinition.animations.map((animation) =>
    assetById
      .get(animation.assetId)!
      .path.replace(/^geometries\//, "")
      .replace(/\.drc$/, ""),
  );
  scope.EMOJI_MAP = Object.fromEntries(
    emoteDefinitions.map((emote) => [emote.key, emote.geometryIndex]),
  );
  const oldBatched = scope.geometryLoader.batched.bind(scope.geometryLoader);
  scope.geometryLoader.batched = async (relative: string, ...args: unknown[]) => {
    const geometries = await oldBatched(relative, ...args);
    const chunk = /\/(?:low\/)?full(?:-lod-\d)?_(\d+)\.drc$/.exec(relative)?.[1];
    if (chunk === undefined) return geometries;
    for (const geometry of geometries) {
      const definition = worldDefinition.geometryGroups?.find(
        (group) => group.chunk === Number(chunk) && group.batchId === geometry.userData.batchId,
      );
      if (!definition) continue;
      geometry.userData.athenaEntityId = definition.id;
      if (!definition.enabled) {
        geometry.setDrawRange(0, 0);
        continue;
      }
      const center = definition.bounds.center;
      geometry.translate(-center[0], -center[1], -center[2]);
      geometry.scale(...definition.scale);
      geometry.rotateX(definition.rotation[0]);
      geometry.rotateY(definition.rotation[1]);
      geometry.rotateZ(definition.rotation[2]);
      geometry.translate(
        center[0] + definition.offset[0],
        center[1] + definition.offset[1],
        center[2] + definition.offset[2],
      );
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
    }
    return geometries;
  };
  scope.presentScene.prototype.createNPCS = async function () {
    this.npcs = npcDefinitions.map(
      (definition) =>
        new scope.npc(this, {
          ...definition.referenceSettings,
          modelURL: assetById.get(definition.modelAssetId)!.path.replace(/^geometries\//, ""),
          bonesURL: assetById.get(definition.bonesAssetId)!.path.replace(/^geometries\//, ""),
          animations: definition.animations.map((animation) =>
            assetById.get(animation.assetId)!.path.replace(/^geometries\//, ""),
          ),
          position: [...definition.position!],
          rotation: [...definition.rotation!],
          // Narrative is retained in the reference demo; Athena has no simulated tutor.
          texts: [],
          icon: false,
        }),
    );
    await Promise.all(this.npcs.map((npc: LegacyContext) => npc.ready));
  };
  scope.presentScene.prototype.initQuests = async function () {};
  const setupLights = scope.planet.prototype.setupLights;
  scope.planet.prototype.setupLights = function () {
    this.lightOptions.cmsOptions = [
      renderingDefinition.light.color,
      renderingDefinition.light.intensity,
    ];
    this.lightOptions.csmPositionOffset = new scope.Spherical(
      renderingDefinition.light.radius,
      renderingDefinition.light.polarAngle,
      renderingDefinition.light.azimuthAngle,
    );
    this.lightOptions.csmForwardOffset = renderingDefinition.light.forwardOffset;
    setupLights.call(this);
  };
  const skyInit = scope.sky.prototype.init;
  scope.sky.prototype.init = function () {
    skyInit.call(this);
    renderingDefinition.sky.colors.forEach((color, index) =>
      this.mesh.material.uniforms[`uColor${index + 1}`].value.set(color),
    );
    this.PARALLAX_AMOUNT = renderingDefinition.sky.parallax;
    this.mesh.scale.setScalar(renderingDefinition.sky.radius / 55);
  };
}
