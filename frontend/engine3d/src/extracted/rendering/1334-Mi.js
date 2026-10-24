/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 770060:773427.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1334(scope) {
scope.Mi = function Mi(r) {
  const e = new Uint8Array(r.buffer, r.byteOffset, scope.Oi.length);
  if (e[0] !== scope.Oi[0] || e[1] !== scope.Oi[1] || e[2] !== scope.Oi[2] || e[3] !== scope.Oi[3] || e[4] !== scope.Oi[4] || e[5] !== scope.Oi[5] || e[6] !== scope.Oi[6] || e[7] !== scope.Oi[7] || e[8] !== scope.Oi[8] || e[9] !== scope.Oi[9] || e[10] !== scope.Oi[10] || e[11] !== scope.Oi[11]) throw new Error("Missing KTX 2.0 identifier.");
  const i = {
      vkFormat: 0,
      typeSize: 1,
      pixelWidth: 0,
      pixelHeight: 0,
      pixelDepth: 0,
      layerCount: 0,
      faceCount: 1,
      levelCount: 0,
      supercompressionScheme: 0,
      levels: [],
      dataFormatDescriptor: [{
        vendorId: 0,
        descriptorType: 0,
        versionNumber: 2,
        colorModel: 0,
        colorPrimaries: 1,
        transferFunction: 2,
        flags: 0,
        texelBlockDimension: [0, 0, 0, 0],
        bytesPlane: [0, 0, 0, 0, 0, 0, 0, 0],
        samples: []
      }],
      keyValue: {},
      globalData: null
    },
    s = 17 * Uint32Array.BYTES_PER_ELEMENT,
    a = new scope.Ci(r, scope.Oi.length, s, !0);
  i.vkFormat = a._nextUint32(), i.typeSize = a._nextUint32(), i.pixelWidth = a._nextUint32(), i.pixelHeight = a._nextUint32(), i.pixelDepth = a._nextUint32(), i.layerCount = a._nextUint32(), i.faceCount = a._nextUint32(), i.levelCount = a._nextUint32(), i.supercompressionScheme = a._nextUint32();
  const o = a._nextUint32(),
    l = a._nextUint32(),
    c = a._nextUint32(),
    h = a._nextUint32(),
    d = a._nextUint64(),
    p = a._nextUint64(),
    f = 3 * Math.max(i.levelCount, 1) * 8,
    _ = new scope.Ci(r, scope.Oi.length + s, f, !0);
  for (let Ue = 0, nt = Math.max(i.levelCount, 1); Ue < nt; Ue++) i.levels.push({
    levelData: new Uint8Array(r.buffer, r.byteOffset + _._nextUint64(), _._nextUint64()),
    uncompressedByteLength: _._nextUint64()
  });
  const x = new scope.Ci(r, o, l, !0);
  x._skip(4);
  const b = x._nextUint16(),
    T = x._nextUint16(),
    M = x._nextUint16(),
    w = x._nextUint16(),
    D = {
      vendorId: b,
      descriptorType: T,
      versionNumber: M,
      colorModel: x._nextUint8(),
      colorPrimaries: x._nextUint8(),
      transferFunction: x._nextUint8(),
      flags: x._nextUint8(),
      texelBlockDimension: [x._nextUint8(), x._nextUint8(), x._nextUint8(), x._nextUint8()],
      bytesPlane: [x._nextUint8(), x._nextUint8(), x._nextUint8(), x._nextUint8(), x._nextUint8(), x._nextUint8(), x._nextUint8(), x._nextUint8()],
      samples: []
    },
    R = (w / 4 - 6) / 4;
  for (let Ue = 0; Ue < R; Ue++) {
    const nt = {
      bitOffset: x._nextUint16(),
      bitLength: x._nextUint8(),
      channelType: x._nextUint8(),
      samplePosition: [x._nextUint8(), x._nextUint8(), x._nextUint8(), x._nextUint8()],
      sampleLower: Number.NEGATIVE_INFINITY,
      sampleUpper: Number.POSITIVE_INFINITY
    };
    64 & nt.channelType ? (nt.sampleLower = x._nextInt32(), nt.sampleUpper = x._nextInt32()) : (nt.sampleLower = x._nextUint32(), nt.sampleUpper = x._nextUint32()), D.samples[Ue] = nt;
  }
  i.dataFormatDescriptor.length = 0, i.dataFormatDescriptor.push(D);
  const P = new scope.Ci(r, c, h, !0);
  for (; P._offset < h;) {
    const Ue = P._nextUint32(),
      nt = P._scan(Ue),
      mt = scope.Si(nt);
    if (i.keyValue[mt] = P._nextUint8Array(Ue - nt.byteLength - 1), mt.match(/^ktx/i)) {
      const ve = scope.Si(i.keyValue[mt]);
      i.keyValue[mt] = ve.substring(0, ve.lastIndexOf("\0"));
    }
    P._skip(Ue % 4 ? 4 - Ue % 4 : 0);
  }
  if (p <= 0) return i;
  const U = new scope.Ci(r, d, p, !0),
    O = U._nextUint16(),
    N = U._nextUint16(),
    H = U._nextUint32(),
    F = U._nextUint32(),
    k = U._nextUint32(),
    W = U._nextUint32(),
    $ = [];
  for (let Ue = 0, nt = Math.max(i.levelCount, 1); Ue < nt; Ue++) $.push({
    imageFlags: U._nextUint32(),
    rgbSliceByteOffset: U._nextUint32(),
    rgbSliceByteLength: U._nextUint32(),
    alphaSliceByteOffset: U._nextUint32(),
    alphaSliceByteLength: U._nextUint32()
  });
  const Z = d + U._offset,
    J = Z + H,
    se = J + F,
    re = se + k,
    he = new Uint8Array(r.buffer, r.byteOffset + Z, H),
    ee = new Uint8Array(r.buffer, r.byteOffset + J, F),
    Ie = new Uint8Array(r.buffer, r.byteOffset + se, k),
    Te = new Uint8Array(r.buffer, r.byteOffset + re, W);
  return i.globalData = {
    endpointCount: O,
    selectorCount: N,
    imageDescs: $,
    endpointsData: he,
    selectorsData: ee,
    tablesData: Ie,
    extendedData: Te
  }, i;
};
}
