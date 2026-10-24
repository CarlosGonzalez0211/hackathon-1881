/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1269010:1269779.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1723(scope) {
scope.PlanetMesh = class PlanetMesh extends scope.Mesh {
  constructor(e, i, s, a = 15) {
    super(e, i), this._scene = s, this._visThreshold = a, scope.events$1.on("internal_prerender", this.__checkVisibility, this);
  }
  __checkVisibility() {
    var a;
    if (!this._scene || !((a = this._scene.characters) != null && a.mesh)) return;
    const e = this._scene.characters.mesh._localObject;
    this.geometry.boundingSphere === null && this.geometry.computeBoundingSphere(), scope._s$5.copy(this.geometry.boundingSphere), scope._v0$g.copy(e.position).sub(scope._s$5.center).normalize();
    const i = scope._s$5.center.distanceTo(e.position),
      s = Math.min(i, scope._s$5.radius);
    scope._v1$a.copy(scope._s$5.center).addScaledVector(scope._v0$g, s), this.visible = e.position.distanceTo(scope._v1$a) < this._visThreshold;
  }
  dispose() {
    var e;
    scope.events$1.off("internal_prerender", this.__checkVisibility, this), (e = super.dispose) == null || e.call(this);
  }
};
}
