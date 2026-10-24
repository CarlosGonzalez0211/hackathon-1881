/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1117110:1119826.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1648(scope) {
scope.integrateEffect = function integrateEffect(r, e, i) {
  let s = e.getFragmentShader(),
    a = e.getVertexShader();
  const o = s !== void 0 && /mainImage/.test(s),
    l = s !== void 0 && /mainUv/.test(s);
  if (i.attributes |= e.getAttributes(), s === void 0) throw new Error(`Missing fragment shader (${e.name})`);
  if (l && (i.attributes & scope.EffectAttribute.CONVOLUTION) !== 0) throw new Error(`Effects that transform UVs are incompatible with convolution effects (${e.name})`);
  if (!o && !l) throw new Error(`Could not find mainImage or mainUv function (${e.name})`);
  {
    const c = /\w+\s+(\w+)\([\w\s,]*\)\s*{/g,
      h = i.shaderParts;
    let d = h.get(scope.EffectShaderSection.FRAGMENT_HEAD) || "",
      p = h.get(scope.EffectShaderSection.FRAGMENT_MAIN_UV) || "",
      f = h.get(scope.EffectShaderSection.FRAGMENT_MAIN_IMAGE) || "",
      _ = h.get(scope.EffectShaderSection.VERTEX_HEAD) || "",
      x = h.get(scope.EffectShaderSection.VERTEX_MAIN_SUPPORT) || "";
    const b = new Set(),
      T = new Set();
    if (l && (p += `	${r}MainUv(UV);
`, i.uvTransformation = !0), a !== null && /mainSupport/.test(a)) {
      const D = /mainSupport *\([\w\s]*?uv\s*?\)/.test(a);
      x += `	${r}MainSupport(`, x += D ? `vUv);
` : `);
`;
      for (const R of a.matchAll(/(?:varying\s+\w+\s+([\S\s]*?);)/g)) for (const P of R[1].split(/\s*,\s*/)) i.varyings.add(P), b.add(P), T.add(P);
      for (const R of a.matchAll(c)) T.add(R[1]);
    }
    for (const D of s.matchAll(c)) T.add(D[1]);
    for (const D of e.defines.keys()) T.add(D.replace(/\([\w\s,]*\)/g, ""));
    for (const D of e.uniforms.keys()) T.add(D);
    T.delete("while"), T.delete("for"), T.delete("if"), e.uniforms.forEach((D, R) => i.uniforms.set(r + R.charAt(0).toUpperCase() + R.slice(1), D)), e.defines.forEach((D, R) => i.defines.set(r + R.charAt(0).toUpperCase() + R.slice(1), D));
    const M = new Map([["fragment", s], ["vertex", a]]);
    scope.prefixSubstrings(r, T, i.defines), scope.prefixSubstrings(r, T, M), s = M.get("fragment"), a = M.get("vertex");
    const w = e.blendMode;
    if (i.blendModes.set(w.blendFunction, w), o) {
      e.inputColorSpace !== null && e.inputColorSpace !== i.colorSpace && (f += e.inputColorSpace === scope.SRGBColorSpace ? `color0 = sRGBTransferOETF(color0);
	` : `color0 = sRGBToLinear(color0);
	`), e.outputColorSpace !== scope.NoColorSpace ? i.colorSpace = e.outputColorSpace : e.inputColorSpace !== null && (i.colorSpace = e.inputColorSpace);
      const D = /MainImage *\([\w\s,]*?depth[\w\s,]*?\)/;
      f += `${r}MainImage(color0, UV, `, (i.attributes & scope.EffectAttribute.DEPTH) !== 0 && D.test(s) && (f += "depth, ", i.readDepth = !0), f += `color1);
	`;
      const R = r + "BlendOpacity";
      i.uniforms.set(R, w.opacity), f += `color0 = blend${w.blendFunction}(color0, color1, ${R});

	`, d += `uniform float ${R};

`;
    }
    if (d += s + `
`, a !== null && (_ += a + `
`), h.set(scope.EffectShaderSection.FRAGMENT_HEAD, d), h.set(scope.EffectShaderSection.FRAGMENT_MAIN_UV, p), h.set(scope.EffectShaderSection.FRAGMENT_MAIN_IMAGE, f), h.set(scope.EffectShaderSection.VERTEX_HEAD, _), h.set(scope.EffectShaderSection.VERTEX_MAIN_SUPPORT, x), e.extensions !== null) for (const D of e.extensions) i.extensions.add(D);
  }
};
}
