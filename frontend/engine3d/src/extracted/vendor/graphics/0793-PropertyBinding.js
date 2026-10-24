/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 297952:303969.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0793(scope) {
scope.PropertyBinding = class PropertyBinding {
  constructor(e, i, s) {
    this.path = i, this.parsedPath = s || scope.PropertyBinding.parseTrackName(i), this.node = scope.PropertyBinding.findNode(e, this.parsedPath.nodeName), this.rootNode = e, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
  }
  static create(e, i, s) {
    return e && e.isAnimationObjectGroup ? new scope.PropertyBinding.Composite(e, i, s) : new scope.PropertyBinding(e, i, s);
  }
  static sanitizeNodeName(e) {
    return e.replace(/\s/g, "_").replace(scope._reservedRe, "");
  }
  static parseTrackName(e) {
    const i = scope._trackRe.exec(e);
    if (i === null) throw new Error("PropertyBinding: Cannot parse trackName: " + e);
    const s = {
        nodeName: i[2],
        objectName: i[3],
        objectIndex: i[4],
        propertyName: i[5],
        propertyIndex: i[6]
      },
      a = s.nodeName && s.nodeName.lastIndexOf(".");
    if (a !== void 0 && a !== -1) {
      const o = s.nodeName.substring(a + 1);
      scope._supportedObjectNames.indexOf(o) !== -1 && (s.nodeName = s.nodeName.substring(0, a), s.objectName = o);
    }
    if (s.propertyName === null || s.propertyName.length === 0) throw new Error("PropertyBinding: can not parse propertyName from trackName: " + e);
    return s;
  }
  static findNode(e, i) {
    if (i === void 0 || i === "" || i === "." || i === -1 || i === e.name || i === e.uuid) return e;
    if (e.skeleton) {
      const s = e.skeleton.getBoneByName(i);
      if (s !== void 0) return s;
    }
    if (e.children) {
      const s = function (o) {
          for (let l = 0; l < o.length; l++) {
            const c = o[l];
            if (c.name === i || c.uuid === i) return c;
            const h = s(c.children);
            if (h) return h;
          }
          return null;
        },
        a = s(e.children);
      if (a) return a;
    }
    return null;
  }
  _getValue_unavailable() {}
  _setValue_unavailable() {}
  _getValue_direct(e, i) {
    e[i] = this.targetObject[this.propertyName];
  }
  _getValue_array(e, i) {
    const s = this.resolvedProperty;
    for (let a = 0, o = s.length; a !== o; ++a) e[i++] = s[a];
  }
  _getValue_arrayElement(e, i) {
    e[i] = this.resolvedProperty[this.propertyIndex];
  }
  _getValue_toArray(e, i) {
    this.resolvedProperty.toArray(e, i);
  }
  _setValue_direct(e, i) {
    this.targetObject[this.propertyName] = e[i];
  }
  _setValue_direct_setNeedsUpdate(e, i) {
    this.targetObject[this.propertyName] = e[i], this.targetObject.needsUpdate = !0;
  }
  _setValue_direct_setMatrixWorldNeedsUpdate(e, i) {
    this.targetObject[this.propertyName] = e[i], this.targetObject.matrixWorldNeedsUpdate = !0;
  }
  _setValue_array(e, i) {
    const s = this.resolvedProperty;
    for (let a = 0, o = s.length; a !== o; ++a) s[a] = e[i++];
  }
  _setValue_array_setNeedsUpdate(e, i) {
    const s = this.resolvedProperty;
    for (let a = 0, o = s.length; a !== o; ++a) s[a] = e[i++];
    this.targetObject.needsUpdate = !0;
  }
  _setValue_array_setMatrixWorldNeedsUpdate(e, i) {
    const s = this.resolvedProperty;
    for (let a = 0, o = s.length; a !== o; ++a) s[a] = e[i++];
    this.targetObject.matrixWorldNeedsUpdate = !0;
  }
  _setValue_arrayElement(e, i) {
    this.resolvedProperty[this.propertyIndex] = e[i];
  }
  _setValue_arrayElement_setNeedsUpdate(e, i) {
    this.resolvedProperty[this.propertyIndex] = e[i], this.targetObject.needsUpdate = !0;
  }
  _setValue_arrayElement_setMatrixWorldNeedsUpdate(e, i) {
    this.resolvedProperty[this.propertyIndex] = e[i], this.targetObject.matrixWorldNeedsUpdate = !0;
  }
  _setValue_fromArray(e, i) {
    this.resolvedProperty.fromArray(e, i);
  }
  _setValue_fromArray_setNeedsUpdate(e, i) {
    this.resolvedProperty.fromArray(e, i), this.targetObject.needsUpdate = !0;
  }
  _setValue_fromArray_setMatrixWorldNeedsUpdate(e, i) {
    this.resolvedProperty.fromArray(e, i), this.targetObject.matrixWorldNeedsUpdate = !0;
  }
  _getValue_unbound(e, i) {
    this.bind(), this.getValue(e, i);
  }
  _setValue_unbound(e, i) {
    this.bind(), this.setValue(e, i);
  }
  bind() {
    let e = this.node;
    const i = this.parsedPath,
      s = i.objectName,
      a = i.propertyName;
    let o = i.propertyIndex;
    if (e || (e = scope.PropertyBinding.findNode(this.rootNode, i.nodeName), this.node = e), this.getValue = this._getValue_unavailable, this.setValue = this._setValue_unavailable, !e) {
      console.warn("THREE.PropertyBinding: No target node found for track: " + this.path + ".");
      return;
    }
    if (s) {
      let d = i.objectIndex;
      switch (s) {
        case "materials":
          if (!e.material) {
            console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
            return;
          }
          if (!e.material.materials) {
            console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.", this);
            return;
          }
          e = e.material.materials;
          break;
        case "bones":
          if (!e.skeleton) {
            console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.", this);
            return;
          }
          e = e.skeleton.bones;
          for (let p = 0; p < e.length; p++) if (e[p].name === d) {
            d = p;
            break;
          }
          break;
        case "map":
          if ("map" in e) {
            e = e.map;
            break;
          }
          if (!e.material) {
            console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
            return;
          }
          if (!e.material.map) {
            console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.", this);
            return;
          }
          e = e.material.map;
          break;
        default:
          if (e[s] === void 0) {
            console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.", this);
            return;
          }
          e = e[s];
      }
      if (d !== void 0) {
        if (e[d] === void 0) {
          console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.", this, e);
          return;
        }
        e = e[d];
      }
    }
    const l = e[a];
    if (l === void 0) {
      const d = i.nodeName;
      console.error("THREE.PropertyBinding: Trying to update property for track: " + d + "." + a + " but it wasn't found.", e);
      return;
    }
    let c = this.Versioning.None;
    this.targetObject = e, e.isMaterial === !0 ? c = this.Versioning.NeedsUpdate : e.isObject3D === !0 && (c = this.Versioning.MatrixWorldNeedsUpdate);
    let h = this.BindingType.Direct;
    if (o !== void 0) {
      if (a === "morphTargetInfluences") {
        if (!e.geometry) {
          console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.", this);
          return;
        }
        if (!e.geometry.morphAttributes) {
          console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.", this);
          return;
        }
        e.morphTargetDictionary[o] !== void 0 && (o = e.morphTargetDictionary[o]);
      }
      h = this.BindingType.ArrayElement, this.resolvedProperty = l, this.propertyIndex = o;
    } else l.fromArray !== void 0 && l.toArray !== void 0 ? (h = this.BindingType.HasFromToArray, this.resolvedProperty = l) : Array.isArray(l) ? (h = this.BindingType.EntireArray, this.resolvedProperty = l) : this.propertyName = a;
    this.getValue = this.GetterByBindingType[h], this.setValue = this.SetterByBindingTypeAndVersioning[h][c];
  }
  unbind() {
    this.node = null, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
  }
};
}
