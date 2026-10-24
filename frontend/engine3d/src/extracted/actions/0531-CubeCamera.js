/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 162495:164615.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0531(scope) {
scope.CubeCamera = class CubeCamera extends scope.Object3D {
  constructor(e, i, s) {
    super(), this.type = "CubeCamera", this.renderTarget = s, this.coordinateSystem = null, this.activeMipmapLevel = 0;
    const a = new scope.PerspectiveCamera(scope.fov, scope.aspect, e, i);
    a.layers = this.layers, this.add(a);
    const o = new scope.PerspectiveCamera(scope.fov, scope.aspect, e, i);
    o.layers = this.layers, this.add(o);
    const l = new scope.PerspectiveCamera(scope.fov, scope.aspect, e, i);
    l.layers = this.layers, this.add(l);
    const c = new scope.PerspectiveCamera(scope.fov, scope.aspect, e, i);
    c.layers = this.layers, this.add(c);
    const h = new scope.PerspectiveCamera(scope.fov, scope.aspect, e, i);
    h.layers = this.layers, this.add(h);
    const d = new scope.PerspectiveCamera(scope.fov, scope.aspect, e, i);
    d.layers = this.layers, this.add(d);
  }
  updateCoordinateSystem() {
    const e = this.coordinateSystem,
      i = this.children.concat(),
      [s, a, o, l, c, h] = i;
    for (const d of i) this.remove(d);
    if (e === scope.WebGLCoordinateSystem) s.up.set(0, 1, 0), s.lookAt(1, 0, 0), a.up.set(0, 1, 0), a.lookAt(-1, 0, 0), o.up.set(0, 0, -1), o.lookAt(0, 1, 0), l.up.set(0, 0, 1), l.lookAt(0, -1, 0), c.up.set(0, 1, 0), c.lookAt(0, 0, 1), h.up.set(0, 1, 0), h.lookAt(0, 0, -1);else if (e === scope.WebGPUCoordinateSystem) s.up.set(0, -1, 0), s.lookAt(-1, 0, 0), a.up.set(0, -1, 0), a.lookAt(1, 0, 0), o.up.set(0, 0, 1), o.lookAt(0, 1, 0), l.up.set(0, 0, -1), l.lookAt(0, -1, 0), c.up.set(0, -1, 0), c.lookAt(0, 0, 1), h.up.set(0, -1, 0), h.lookAt(0, 0, -1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + e);
    for (const d of i) this.add(d), d.updateMatrixWorld();
  }
  update(e, i) {
    this.parent === null && this.updateMatrixWorld();
    const {
      renderTarget: s,
      activeMipmapLevel: a
    } = this;
    this.coordinateSystem !== e.coordinateSystem && (this.coordinateSystem = e.coordinateSystem, this.updateCoordinateSystem());
    const [o, l, c, h, d, p] = this.children,
      f = e.getRenderTarget(),
      _ = e.getActiveCubeFace(),
      x = e.getActiveMipmapLevel(),
      b = e.xr.enabled;
    e.xr.enabled = !1;
    const T = s.texture.generateMipmaps;
    s.texture.generateMipmaps = !1, e.setRenderTarget(s, 0, a), e.render(i, o), e.setRenderTarget(s, 1, a), e.render(i, l), e.setRenderTarget(s, 2, a), e.render(i, c), e.setRenderTarget(s, 3, a), e.render(i, h), e.setRenderTarget(s, 4, a), e.render(i, d), s.texture.generateMipmaps = T, e.setRenderTarget(s, 5, a), e.render(i, p), e.setRenderTarget(f, _, x), e.xr.enabled = b, s.texture.needsPMREMUpdate = !0;
  }
};
}
