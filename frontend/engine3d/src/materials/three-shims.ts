/**
 * The recovered Messenger bundle (three r180) was tree-shaken: its renderer still knows
 * toon materials (`ShaderLib.toon`, `isMeshToonMaterial`), ambient lights and fog, but the
 * `MeshToonMaterial`, `AmbientLight` and `Fog` classes were dropped. These minimal ports of
 * the r180 classes are built on the runtime's own `Material`/`Light`/`Color`, so every
 * object keeps the recovered renderer's class identity (never import npm `three`).
 */
import type { LegacyContext } from "../runtime/legacy-context";

const TANGENT_SPACE_NORMAL_MAP = 0;

/** Install the missing classes on `scope` (no-op for classes the runtime already has). */
export function ensureAthenaThreeClasses(scope: LegacyContext) {
  if (!scope.MeshToonMaterial && scope.Material) {
    scope.MeshToonMaterial = class MeshToonMaterial extends scope.Material {
      constructor(parameters?: Record<string, unknown>) {
        super();
        this.isMeshToonMaterial = true;
        this.defines = { TOON: "" };
        this.type = "MeshToonMaterial";
        this.color = new scope.Color(0xffffff);
        this.map = null;
        this.gradientMap = null;
        this.lightMap = null;
        this.lightMapIntensity = 1;
        this.aoMap = null;
        this.aoMapIntensity = 1;
        this.emissive = new scope.Color(0x000000);
        this.emissiveIntensity = 1;
        this.emissiveMap = null;
        this.bumpMap = null;
        this.bumpScale = 1;
        this.normalMap = null;
        this.normalMapType = TANGENT_SPACE_NORMAL_MAP;
        this.normalScale = new scope.Vector2(1, 1);
        this.displacementMap = null;
        this.displacementScale = 1;
        this.displacementBias = 0;
        this.alphaMap = null;
        this.wireframe = false;
        this.flatShading = false;
        this.wireframeLinewidth = 1;
        this.wireframeLinecap = "round";
        this.wireframeLinejoin = "round";
        this.fog = true;
        if (parameters) this.setValues(parameters);
      }
      copy(source: LegacyContext) {
        super.copy(source);
        this.color.copy(source.color);
        for (const key of [
          "map",
          "gradientMap",
          "lightMap",
          "lightMapIntensity",
          "aoMap",
          "aoMapIntensity",
          "emissiveIntensity",
          "emissiveMap",
          "bumpMap",
          "bumpScale",
          "normalMap",
          "normalMapType",
          "displacementMap",
          "displacementScale",
          "displacementBias",
          "alphaMap",
          "wireframe",
          "flatShading",
          "wireframeLinewidth",
          "wireframeLinecap",
          "wireframeLinejoin",
          "fog",
        ])
          this[key] = source[key];
        this.emissive.copy(source.emissive);
        this.normalScale.copy(source.normalScale);
        return this;
      }
    };
  }
  if (!scope.AmbientLight && scope.Light) {
    scope.AmbientLight = class AmbientLight extends scope.Light {
      constructor(color?: unknown, intensity?: number) {
        super(color, intensity);
        this.isAmbientLight = true;
        this.type = "AmbientLight";
      }
    };
  }
  if (!scope.Fog && scope.Color) {
    scope.Fog = class Fog {
      readonly isFog = true;
      name = "";
      color: LegacyContext;
      constructor(
        color: unknown,
        public near = 1,
        public far = 1000,
      ) {
        this.color = new scope.Color(color);
      }
      clone() {
        return new scope.Fog(this.color, this.near, this.far);
      }
      toJSON() {
        return {
          type: "Fog",
          name: this.name,
          color: this.color.getHex(),
          near: this.near,
          far: this.far,
        };
      }
    };
  }
}
