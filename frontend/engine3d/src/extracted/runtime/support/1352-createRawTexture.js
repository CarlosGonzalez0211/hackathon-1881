/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 826009:827871.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1352(scope) {
scope.createRawTexture = async function createRawTexture(r) {
  const {
    vkFormat: e
  } = r;
  if (scope.FORMAT_MAP[e] === void 0) throw new Error("THREE.KTX2Loader: Unsupported vkFormat: " + e);
  scope.TYPE_MAP[e] === void 0 && console.warn('THREE.KTX2Loader: Missing ".type" for vkFormat: ' + e);
  let i;
  r.supercompressionScheme === scope.n && (scope._zstd || (scope._zstd = new Promise(async l => {
    const c = new scope.Q();
    await c.init(), l(c);
  })), i = await scope._zstd);
  const s = [];
  for (let l = 0; l < r.levels.length; l++) {
    const c = Math.max(1, r.pixelWidth >> l),
      h = Math.max(1, r.pixelHeight >> l),
      d = r.pixelDepth ? Math.max(1, r.pixelDepth >> l) : 0,
      p = r.levels[l];
    let f;
    if (r.supercompressionScheme === scope.t) f = p.levelData;else if (r.supercompressionScheme === scope.n) f = i.decode(p.levelData, p.uncompressedByteLength);else throw new Error("THREE.KTX2Loader: Unsupported supercompressionScheme.");
    let _;
    scope.TYPE_MAP[e] === scope.FloatType ? _ = new Float32Array(f.buffer, f.byteOffset, f.byteLength / Float32Array.BYTES_PER_ELEMENT) : scope.TYPE_MAP[e] === scope.HalfFloatType ? _ = new Uint16Array(f.buffer, f.byteOffset, f.byteLength / Uint16Array.BYTES_PER_ELEMENT) : scope.TYPE_MAP[e] === scope.UnsignedInt5999Type || scope.TYPE_MAP[e] === scope.UnsignedInt101111Type ? _ = new Uint32Array(f.buffer, f.byteOffset, f.byteLength / Uint32Array.BYTES_PER_ELEMENT) : _ = f, s.push({
      data: _,
      width: c,
      height: h,
      depth: d
    });
  }
  const a = r.levelCount === 0 || s.length > 1;
  let o;
  if (scope.UNCOMPRESSED_FORMATS.has(scope.FORMAT_MAP[e])) o = r.pixelDepth === 0 ? new scope.DataTexture(s[0].data, r.pixelWidth, r.pixelHeight) : new scope.Data3DTexture(s[0].data, r.pixelWidth, r.pixelHeight, r.pixelDepth), o.minFilter = a ? scope.NearestMipmapNearestFilter : scope.NearestFilter, o.magFilter = scope.NearestFilter, o.generateMipmaps = r.levelCount === 0;else {
    if (r.pixelDepth > 0) throw new Error("THREE.KTX2Loader: Unsupported pixelDepth.");
    o = new scope.CompressedTexture(s, r.pixelWidth, r.pixelHeight), o.minFilter = a ? scope.LinearMipmapLinearFilter : scope.LinearFilter, o.magFilter = scope.LinearFilter;
  }
  return o.mipmaps = s, o.type = scope.TYPE_MAP[e], o.format = scope.FORMAT_MAP[e], o.colorSpace = scope.parseColorSpace(r), o.needsUpdate = !0, Promise.resolve(o);
};
}
