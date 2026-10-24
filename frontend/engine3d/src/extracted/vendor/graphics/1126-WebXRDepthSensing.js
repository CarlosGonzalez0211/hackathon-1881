/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 619218:619926.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1126(scope) {
scope.WebXRDepthSensing = class WebXRDepthSensing {
  constructor() {
    this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
  }
  init(e, i) {
    if (this.texture === null) {
      const s = new scope.ExternalTexture(e.texture);
      (e.depthNear !== i.depthNear || e.depthFar !== i.depthFar) && (this.depthNear = e.depthNear, this.depthFar = e.depthFar), this.texture = s;
    }
  }
  getMesh(e) {
    if (this.texture !== null && this.mesh === null) {
      const i = e.cameras[0].viewport,
        s = new scope.ShaderMaterial({
          vertexShader: scope._occlusion_vertex,
          fragmentShader: scope._occlusion_fragment,
          uniforms: {
            depthColor: {
              value: this.texture
            },
            depthWidth: {
              value: i.z
            },
            depthHeight: {
              value: i.w
            }
          }
        });
      this.mesh = new scope.Mesh(new scope.PlaneGeometry(20, 20), s);
    }
    return this.mesh;
  }
  reset() {
    this.texture = null, this.mesh = null;
  }
  getDepthTexture() {
    return this.texture;
  }
};
}
