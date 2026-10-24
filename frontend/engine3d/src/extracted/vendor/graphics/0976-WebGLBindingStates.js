/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 487121:491737.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0976(scope) {
scope.WebGLBindingStates = function WebGLBindingStates(r, e) {
  const i = r.getParameter(r.MAX_VERTEX_ATTRIBS),
    s = {},
    a = _(null);
  let o = a,
    l = !1;
  function c(k, W, $, Z, J) {
    let se = !1;
    const re = f(Z, $, W);
    o !== re && (o = re, d(o.object)), se = x(k, Z, $, J), se && b(k, Z, $, J), J !== null && e.update(J, r.ELEMENT_ARRAY_BUFFER), (se || l) && (l = !1, P(k, W, $, Z), J !== null && r.bindBuffer(r.ELEMENT_ARRAY_BUFFER, e.get(J).buffer));
  }
  function h() {
    return r.createVertexArray();
  }
  function d(k) {
    return r.bindVertexArray(k);
  }
  function p(k) {
    return r.deleteVertexArray(k);
  }
  function f(k, W, $) {
    const Z = $.wireframe === !0;
    let J = s[k.id];
    J === void 0 && (J = {}, s[k.id] = J);
    let se = J[W.id];
    se === void 0 && (se = {}, J[W.id] = se);
    let re = se[Z];
    return re === void 0 && (re = _(h()), se[Z] = re), re;
  }
  function _(k) {
    const W = [],
      $ = [],
      Z = [];
    for (let J = 0; J < i; J++) W[J] = 0, $[J] = 0, Z[J] = 0;
    return {
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: W,
      enabledAttributes: $,
      attributeDivisors: Z,
      object: k,
      attributes: {},
      index: null
    };
  }
  function x(k, W, $, Z) {
    const J = o.attributes,
      se = W.attributes;
    let re = 0;
    const he = $.getAttributes();
    for (const ee in he) if (he[ee].location >= 0) {
      const Te = J[ee];
      let Ue = se[ee];
      if (Ue === void 0 && (ee === "instanceMatrix" && k.instanceMatrix && (Ue = k.instanceMatrix), ee === "instanceColor" && k.instanceColor && (Ue = k.instanceColor)), Te === void 0 || Te.attribute !== Ue || Ue && Te.data !== Ue.data) return !0;
      re++;
    }
    return o.attributesNum !== re || o.index !== Z;
  }
  function b(k, W, $, Z) {
    const J = {},
      se = W.attributes;
    let re = 0;
    const he = $.getAttributes();
    for (const ee in he) if (he[ee].location >= 0) {
      let Te = se[ee];
      Te === void 0 && (ee === "instanceMatrix" && k.instanceMatrix && (Te = k.instanceMatrix), ee === "instanceColor" && k.instanceColor && (Te = k.instanceColor));
      const Ue = {};
      Ue.attribute = Te, Te && Te.data && (Ue.data = Te.data), J[ee] = Ue, re++;
    }
    o.attributes = J, o.attributesNum = re, o.index = Z;
  }
  function T() {
    const k = o.newAttributes;
    for (let W = 0, $ = k.length; W < $; W++) k[W] = 0;
  }
  function M(k) {
    w(k, 0);
  }
  function w(k, W) {
    const $ = o.newAttributes,
      Z = o.enabledAttributes,
      J = o.attributeDivisors;
    $[k] = 1, Z[k] === 0 && (r.enableVertexAttribArray(k), Z[k] = 1), J[k] !== W && (r.vertexAttribDivisor(k, W), J[k] = W);
  }
  function D() {
    const k = o.newAttributes,
      W = o.enabledAttributes;
    for (let $ = 0, Z = W.length; $ < Z; $++) W[$] !== k[$] && (r.disableVertexAttribArray($), W[$] = 0);
  }
  function R(k, W, $, Z, J, se, re) {
    re === !0 ? r.vertexAttribIPointer(k, W, $, J, se) : r.vertexAttribPointer(k, W, $, Z, J, se);
  }
  function P(k, W, $, Z) {
    T();
    const J = Z.attributes,
      se = $.getAttributes(),
      re = W.defaultAttributeValues;
    for (const he in se) {
      const ee = se[he];
      if (ee.location >= 0) {
        let Ie = J[he];
        if (Ie === void 0 && (he === "instanceMatrix" && k.instanceMatrix && (Ie = k.instanceMatrix), he === "instanceColor" && k.instanceColor && (Ie = k.instanceColor)), Ie !== void 0) {
          const Te = Ie.normalized,
            Ue = Ie.itemSize,
            nt = e.get(Ie);
          if (nt === void 0) continue;
          const mt = nt.buffer,
            ve = nt.type,
            ne = nt.bytesPerElement,
            z = ve === r.INT || ve === r.UNSIGNED_INT || Ie.gpuType === scope.IntType;
          if (Ie.isInterleavedBufferAttribute) {
            const V = Ie.data,
              _e = V.stride,
              Le = Ie.offset;
            if (V.isInstancedInterleavedBuffer) {
              for (let pe = 0; pe < ee.locationSize; pe++) w(ee.location + pe, V.meshPerAttribute);
              k.isInstancedMesh !== !0 && Z._maxInstanceCount === void 0 && (Z._maxInstanceCount = V.meshPerAttribute * V.count);
            } else for (let pe = 0; pe < ee.locationSize; pe++) M(ee.location + pe);
            r.bindBuffer(r.ARRAY_BUFFER, mt);
            for (let pe = 0; pe < ee.locationSize; pe++) R(ee.location + pe, Ue / ee.locationSize, ve, Te, _e * ne, (Le + Ue / ee.locationSize * pe) * ne, z);
          } else {
            if (Ie.isInstancedBufferAttribute) {
              for (let V = 0; V < ee.locationSize; V++) w(ee.location + V, Ie.meshPerAttribute);
              k.isInstancedMesh !== !0 && Z._maxInstanceCount === void 0 && (Z._maxInstanceCount = Ie.meshPerAttribute * Ie.count);
            } else for (let V = 0; V < ee.locationSize; V++) M(ee.location + V);
            r.bindBuffer(r.ARRAY_BUFFER, mt);
            for (let V = 0; V < ee.locationSize; V++) R(ee.location + V, Ue / ee.locationSize, ve, Te, Ue * ne, Ue / ee.locationSize * V * ne, z);
          }
        } else if (re !== void 0) {
          const Te = re[he];
          if (Te !== void 0) switch (Te.length) {
            case 2:
              r.vertexAttrib2fv(ee.location, Te);
              break;
            case 3:
              r.vertexAttrib3fv(ee.location, Te);
              break;
            case 4:
              r.vertexAttrib4fv(ee.location, Te);
              break;
            default:
              r.vertexAttrib1fv(ee.location, Te);
          }
        }
      }
    }
    D();
  }
  function U() {
    H();
    for (const k in s) {
      const W = s[k];
      for (const $ in W) {
        const Z = W[$];
        for (const J in Z) p(Z[J].object), delete Z[J];
        delete W[$];
      }
      delete s[k];
    }
  }
  function O(k) {
    if (s[k.id] === void 0) return;
    const W = s[k.id];
    for (const $ in W) {
      const Z = W[$];
      for (const J in Z) p(Z[J].object), delete Z[J];
      delete W[$];
    }
    delete s[k.id];
  }
  function N(k) {
    for (const W in s) {
      const $ = s[W];
      if ($[k.id] === void 0) continue;
      const Z = $[k.id];
      for (const J in Z) p(Z[J].object), delete Z[J];
      delete $[k.id];
    }
  }
  function H() {
    F(), l = !0, o !== a && (o = a, d(o.object));
  }
  function F() {
    a.geometry = null, a.program = null, a.wireframe = !1;
  }
  return {
    setup: c,
    reset: H,
    resetDefaultState: F,
    dispose: U,
    releaseStatesOfGeometry: O,
    releaseStatesOfProgram: N,
    initAttributes: T,
    enableAttribute: M,
    disableUnusedAttributes: D
  };
};
}
