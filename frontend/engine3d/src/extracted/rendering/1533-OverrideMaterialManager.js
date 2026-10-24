/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 936451:939391.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1533(scope) {
scope.OverrideMaterialManager = class {
  constructor(r = null) {
    this.originalMaterials = new Map(), this.material = null, this.materials = null, this.materialsBackSide = null, this.materialsDoubleSide = null, this.materialsFlatShaded = null, this.materialsFlatShadedBackSide = null, this.materialsFlatShadedDoubleSide = null, this.setMaterial(r), this.meshCount = 0, this.replaceMaterial = e => {
      if (e.isMesh) {
        let i;
        if (e.material.flatShading) switch (e.material.side) {
          case scope.DoubleSide:
            i = this.materialsFlatShadedDoubleSide;
            break;
          case scope.BackSide:
            i = this.materialsFlatShadedBackSide;
            break;
          default:
            i = this.materialsFlatShaded;
            break;
        } else switch (e.material.side) {
          case scope.DoubleSide:
            i = this.materialsDoubleSide;
            break;
          case scope.BackSide:
            i = this.materialsBackSide;
            break;
          default:
            i = this.materials;
            break;
        }
        this.originalMaterials.set(e, e.material), e.isSkinnedMesh ? e.material = i[2] : e.isInstancedMesh ? e.material = i[1] : e.material = i[0], ++this.meshCount;
      }
    };
  }
  cloneMaterial(r) {
    if (!(r instanceof scope.ShaderMaterial)) return r.clone();
    const e = r.uniforms,
      i = new Map();
    for (const a in e) {
      const o = e[a].value;
      o.isRenderTargetTexture && (e[a].value = null, i.set(a, o));
    }
    const s = r.clone();
    for (const a of i) e[a[0]].value = a[1], s.uniforms[a[0]].value = a[1];
    return s;
  }
  setMaterial(r) {
    if (this.disposeMaterials(), this.material = r, r !== null) {
      const e = this.materials = [this.cloneMaterial(r), this.cloneMaterial(r), this.cloneMaterial(r)];
      for (const i of e) i.uniforms = Object.assign({}, r.uniforms), i.side = scope.FrontSide;
      e[2].skinning = !0, this.materialsBackSide = e.map(i => {
        const s = this.cloneMaterial(i);
        return s.uniforms = Object.assign({}, r.uniforms), s.side = scope.BackSide, s;
      }), this.materialsDoubleSide = e.map(i => {
        const s = this.cloneMaterial(i);
        return s.uniforms = Object.assign({}, r.uniforms), s.side = scope.DoubleSide, s;
      }), this.materialsFlatShaded = e.map(i => {
        const s = this.cloneMaterial(i);
        return s.uniforms = Object.assign({}, r.uniforms), s.flatShading = !0, s;
      }), this.materialsFlatShadedBackSide = e.map(i => {
        const s = this.cloneMaterial(i);
        return s.uniforms = Object.assign({}, r.uniforms), s.flatShading = !0, s.side = scope.BackSide, s;
      }), this.materialsFlatShadedDoubleSide = e.map(i => {
        const s = this.cloneMaterial(i);
        return s.uniforms = Object.assign({}, r.uniforms), s.flatShading = !0, s.side = scope.DoubleSide, s;
      });
    }
  }
  render(r, e, i) {
    const s = r.shadowMap.enabled;
    if (r.shadowMap.enabled = !1, scope.workaroundEnabled) {
      const a = this.originalMaterials;
      this.meshCount = 0, e.traverse(this.replaceMaterial), r.render(e, i);
      for (const o of a) o[0].material = o[1];
      this.meshCount !== a.size && a.clear();
    } else {
      const a = e.overrideMaterial;
      e.overrideMaterial = this.material, r.render(e, i), e.overrideMaterial = a;
    }
    r.shadowMap.enabled = s;
  }
  disposeMaterials() {
    if (this.material !== null) {
      const r = this.materials.concat(this.materialsBackSide).concat(this.materialsDoubleSide).concat(this.materialsFlatShaded).concat(this.materialsFlatShadedBackSide).concat(this.materialsFlatShadedDoubleSide);
      for (const e of r) e.dispose();
    }
  }
  dispose() {
    this.originalMaterials.clear(), this.disposeMaterials();
  }
  static get workaroundEnabled() {
    return scope.workaroundEnabled;
  }
  static set workaroundEnabled(r) {
    scope.workaroundEnabled = r;
  }
};
}
