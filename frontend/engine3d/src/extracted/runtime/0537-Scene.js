/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 170053:171530.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0537(scope) {
scope.Scene = class Scene extends scope.Object3D {
  constructor() {
    super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new scope.Euler(), this.environmentIntensity = 1, this.environmentRotation = new scope.Euler(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
      detail: this
    }));
  }
  copy(e, i) {
    return super.copy(e, i), e.background !== null && (this.background = e.background.clone()), e.environment !== null && (this.environment = e.environment.clone()), e.fog !== null && (this.fog = e.fog.clone()), this.backgroundBlurriness = e.backgroundBlurriness, this.backgroundIntensity = e.backgroundIntensity, this.backgroundRotation.copy(e.backgroundRotation), this.environmentIntensity = e.environmentIntensity, this.environmentRotation.copy(e.environmentRotation), e.overrideMaterial !== null && (this.overrideMaterial = e.overrideMaterial.clone()), this.matrixAutoUpdate = e.matrixAutoUpdate, this;
  }
  toJSON(e) {
    const i = super.toJSON(e);
    return this.fog !== null && (i.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (i.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (i.object.backgroundIntensity = this.backgroundIntensity), i.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1 && (i.object.environmentIntensity = this.environmentIntensity), i.object.environmentRotation = this.environmentRotation.toArray(), i;
  }
};
}
