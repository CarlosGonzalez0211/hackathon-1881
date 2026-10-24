/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 845704:847449.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1380(scope) {
scope.GLTFLightsExtension = class GLTFLightsExtension {
  constructor(e) {
    this.parser = e, this.name = scope.EXTENSIONS.KHR_LIGHTS_PUNCTUAL, this.cache = {
      refs: {},
      uses: {}
    };
  }
  _markDefs() {
    const e = this.parser,
      i = this.parser.json.nodes || [];
    for (let s = 0, a = i.length; s < a; s++) {
      const o = i[s];
      o.extensions && o.extensions[this.name] && o.extensions[this.name].light !== void 0 && e._addNodeRef(this.cache, o.extensions[this.name].light);
    }
  }
  _loadLight(e) {
    const i = this.parser,
      s = "light:" + e;
    let a = i.cache.get(s);
    if (a) return a;
    const o = i.json,
      h = ((o.extensions && o.extensions[this.name] || {}).lights || [])[e];
    let d;
    const p = new scope.Color(16777215);
    h.color !== void 0 && p.setRGB(h.color[0], h.color[1], h.color[2], scope.LinearSRGBColorSpace);
    const f = h.range !== void 0 ? h.range : 0;
    switch (h.type) {
      case "directional":
        d = new scope.DirectionalLight(p), d.target.position.set(0, 0, -1), d.add(d.target);
        break;
      case "point":
        d = new scope.PointLight(p), d.distance = f;
        break;
      case "spot":
        d = new scope.SpotLight(p), d.distance = f, h.spot = h.spot || {}, h.spot.innerConeAngle = h.spot.innerConeAngle !== void 0 ? h.spot.innerConeAngle : 0, h.spot.outerConeAngle = h.spot.outerConeAngle !== void 0 ? h.spot.outerConeAngle : Math.PI / 4, d.angle = h.spot.outerConeAngle, d.penumbra = 1 - h.spot.innerConeAngle / h.spot.outerConeAngle, d.target.position.set(0, 0, -1), d.add(d.target);
        break;
      default:
        throw new Error("THREE.GLTFLoader: Unexpected light type: " + h.type);
    }
    return d.position.set(0, 0, 0), scope.assignExtrasToUserData(d, h), h.intensity !== void 0 && (d.intensity = h.intensity), d.name = i.createUniqueName(h.name || "light_" + e), a = Promise.resolve(d), i.cache.add(s, a), a;
  }
  getDependency(e, i) {
    if (e === "light") return this._loadLight(i);
  }
  createNodeAttachment(e) {
    const i = this,
      s = this.parser,
      o = s.json.nodes[e],
      c = (o.extensions && o.extensions[this.name] || {}).light;
    return c === void 0 ? null : this._loadLight(c).then(function (h) {
      return s._getNodeRef(i.cache, c, h);
    });
  }
};
}
