/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 317788:318839.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0806(scope) {
scope.Raycaster = class Raycaster {
  constructor(e, i, s = 0, a = 1 / 0) {
    this.ray = new scope.Ray(e, i), this.near = s, this.far = a, this.camera = null, this.layers = new scope.Layers(), this.params = {
      Mesh: {},
      Line: {
        threshold: 1
      },
      LOD: {},
      Points: {
        threshold: 1
      },
      Sprite: {}
    };
  }
  set(e, i) {
    this.ray.set(e, i);
  }
  setFromCamera(e, i) {
    i.isPerspectiveCamera ? (this.ray.origin.setFromMatrixPosition(i.matrixWorld), this.ray.direction.set(e.x, e.y, .5).unproject(i).sub(this.ray.origin).normalize(), this.camera = i) : i.isOrthographicCamera ? (this.ray.origin.set(e.x, e.y, (i.near + i.far) / (i.near - i.far)).unproject(i), this.ray.direction.set(0, 0, -1).transformDirection(i.matrixWorld), this.camera = i) : console.error("THREE.Raycaster: Unsupported camera type: " + i.type);
  }
  setFromXRController(e) {
    return scope._matrix$3.identity().extractRotation(e.matrixWorld), this.ray.origin.setFromMatrixPosition(e.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(scope._matrix$3), this;
  }
  intersectObject(e, i = !0, s = []) {
    return scope.intersect(e, this, s, i), s.sort(scope.ascSort), s;
  }
  intersectObjects(e, i = !0, s = []) {
    for (let a = 0, o = e.length; a < o; a++) scope.intersect(e[a], this, s, i);
    return s.sort(scope.ascSort), s;
  }
};
}
