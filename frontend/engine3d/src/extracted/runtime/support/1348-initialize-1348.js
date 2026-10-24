/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 818987:824248.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1348(scope) {
scope.KTX2Loader.BasisWorker = function () {
  let r, e, i;
  const s = _EngineFormat,
    a = _EngineType,
    o = _TranscoderFormat,
    l = _BasisFormat;
  self.addEventListener("message", function (b) {
    const T = b.data;
    switch (T.type) {
      case "init":
        r = T.config, c(T.transcoderBinary);
        break;
      case "transcode":
        e.then(() => {
          try {
            const {
              faces: M,
              buffers: w,
              width: D,
              height: R,
              hasAlpha: P,
              format: U,
              type: O,
              dfdFlags: N
            } = h(T.buffer);
            self.postMessage({
              type: "transcode",
              id: T.id,
              data: {
                faces: M,
                width: D,
                height: R,
                hasAlpha: P,
                format: U,
                type: O,
                dfdFlags: N
              }
            }, w);
          } catch (M) {
            console.error(M), self.postMessage({
              type: "error",
              id: T.id,
              error: M.message
            });
          }
        });
        break;
    }
  });
  function c(b) {
    e = new Promise(T => {
      i = {
        wasmBinary: b,
        onRuntimeInitialized: T
      }, BASIS(i);
    }).then(() => {
      i.initializeBasis(), i.KTX2File === void 0 && console.warn("THREE.KTX2Loader: Please update Basis Universal transcoder.");
    });
  }
  function h(b) {
    const T = new i.KTX2File(new Uint8Array(b));
    function M() {
      T.close(), T.delete();
    }
    if (!T.isValid()) throw M(), new Error("THREE.KTX2Loader:	Invalid or unsupported .ktx2 file");
    let w;
    if (T.isUASTC()) w = l.UASTC;else if (T.isETC1S()) w = l.ETC1S;else if (T.isHDR()) w = l.UASTC_HDR;else throw new Error("THREE.KTX2Loader: Unknown Basis encoding");
    const D = T.getWidth(),
      R = T.getHeight(),
      P = T.getLayers() || 1,
      U = T.getLevels(),
      O = T.getFaces(),
      N = T.getHasAlpha(),
      H = T.getDFDFlags(),
      {
        transcoderFormat: F,
        engineFormat: k,
        engineType: W
      } = f(w, D, R, N);
    if (!D || !R || !U) throw M(), new Error("THREE.KTX2Loader:	Invalid texture");
    if (!T.startTranscoding()) throw M(), new Error("THREE.KTX2Loader: .startTranscoding failed");
    const $ = [],
      Z = [];
    for (let J = 0; J < O; J++) {
      const se = [];
      for (let re = 0; re < U; re++) {
        const he = [];
        let ee, Ie;
        for (let Ue = 0; Ue < P; Ue++) {
          const nt = T.getImageLevelInfo(re, Ue, J);
          J === 0 && re === 0 && Ue === 0 && (nt.origWidth % 4 !== 0 || nt.origHeight % 4 !== 0) && console.warn("THREE.KTX2Loader: ETC1S and UASTC textures should use multiple-of-four dimensions."), U > 1 ? (ee = nt.origWidth, Ie = nt.origHeight) : (ee = nt.width, Ie = nt.height);
          let mt = new Uint8Array(T.getImageTranscodedSizeInBytes(re, Ue, 0, F));
          const ve = T.transcodeImage(mt, re, Ue, J, F, 0, -1, -1);
          if (W === a.HalfFloatType && (mt = new Uint16Array(mt.buffer, mt.byteOffset, mt.byteLength / Uint16Array.BYTES_PER_ELEMENT)), !ve) throw M(), new Error("THREE.KTX2Loader: .transcodeImage failed.");
          he.push(mt);
        }
        const Te = x(he);
        se.push({
          data: Te,
          width: ee,
          height: Ie
        }), Z.push(Te.buffer);
      }
      $.push({
        mipmaps: se,
        width: D,
        height: R,
        format: k,
        type: W
      });
    }
    return M(), {
      faces: $,
      buffers: Z,
      width: D,
      height: R,
      hasAlpha: N,
      dfdFlags: H,
      format: k,
      type: W
    };
  }
  const d = [{
      if: "astcSupported",
      basisFormat: [l.UASTC],
      transcoderFormat: [o.ASTC_4x4, o.ASTC_4x4],
      engineFormat: [s.RGBA_ASTC_4x4_Format, s.RGBA_ASTC_4x4_Format],
      engineType: [a.UnsignedByteType],
      priorityETC1S: 1 / 0,
      priorityUASTC: 1,
      needsPowerOfTwo: !1
    }, {
      if: "bptcSupported",
      basisFormat: [l.ETC1S, l.UASTC],
      transcoderFormat: [o.BC7_M5, o.BC7_M5],
      engineFormat: [s.RGBA_BPTC_Format, s.RGBA_BPTC_Format],
      engineType: [a.UnsignedByteType],
      priorityETC1S: 3,
      priorityUASTC: 2,
      needsPowerOfTwo: !1
    }, {
      if: "dxtSupported",
      basisFormat: [l.ETC1S, l.UASTC],
      transcoderFormat: [o.BC1, o.BC3],
      engineFormat: [s.RGBA_S3TC_DXT1_Format, s.RGBA_S3TC_DXT5_Format],
      engineType: [a.UnsignedByteType],
      priorityETC1S: 4,
      priorityUASTC: 5,
      needsPowerOfTwo: !1
    }, {
      if: "etc2Supported",
      basisFormat: [l.ETC1S, l.UASTC],
      transcoderFormat: [o.ETC1, o.ETC2],
      engineFormat: [s.RGB_ETC2_Format, s.RGBA_ETC2_EAC_Format],
      engineType: [a.UnsignedByteType],
      priorityETC1S: 1,
      priorityUASTC: 3,
      needsPowerOfTwo: !1
    }, {
      if: "etc1Supported",
      basisFormat: [l.ETC1S, l.UASTC],
      transcoderFormat: [o.ETC1],
      engineFormat: [s.RGB_ETC1_Format],
      engineType: [a.UnsignedByteType],
      priorityETC1S: 2,
      priorityUASTC: 4,
      needsPowerOfTwo: !1
    }, {
      if: "pvrtcSupported",
      basisFormat: [l.ETC1S, l.UASTC],
      transcoderFormat: [o.PVRTC1_4_RGB, o.PVRTC1_4_RGBA],
      engineFormat: [s.RGB_PVRTC_4BPPV1_Format, s.RGBA_PVRTC_4BPPV1_Format],
      engineType: [a.UnsignedByteType],
      priorityETC1S: 5,
      priorityUASTC: 6,
      needsPowerOfTwo: !0
    }, {
      if: "bptcSupported",
      basisFormat: [l.UASTC_HDR],
      transcoderFormat: [o.BC6H],
      engineFormat: [s.RGB_BPTC_UNSIGNED_Format],
      engineType: [a.HalfFloatType],
      priorityHDR: 1,
      needsPowerOfTwo: !1
    }, {
      basisFormat: [l.ETC1S, l.UASTC],
      transcoderFormat: [o.RGBA32, o.RGBA32],
      engineFormat: [s.RGBAFormat, s.RGBAFormat],
      engineType: [a.UnsignedByteType, a.UnsignedByteType],
      priorityETC1S: 100,
      priorityUASTC: 100,
      needsPowerOfTwo: !1
    }, {
      basisFormat: [l.UASTC_HDR],
      transcoderFormat: [o.RGBA_HALF],
      engineFormat: [s.RGBAFormat],
      engineType: [a.HalfFloatType],
      priorityHDR: 100,
      needsPowerOfTwo: !1
    }],
    p = {
      [l.ETC1S]: d.filter(b => b.basisFormat.includes(l.ETC1S)).sort((b, T) => b.priorityUASTC - T.priorityUASTC),
      [l.UASTC]: d.filter(b => b.basisFormat.includes(l.UASTC)).sort((b, T) => b.priorityUASTC - T.priorityUASTC),
      [l.UASTC_HDR]: d.filter(b => b.basisFormat.includes(l.UASTC_HDR)).sort((b, T) => b.priorityHDR - T.priorityHDR)
    };
  function f(b, T, M, w) {
    const D = p[b];
    for (let R = 0; R < D.length; R++) {
      const P = D[R];
      if (P.if && !r[P.if] || !P.basisFormat.includes(b) || w && P.transcoderFormat.length < 2 || P.needsPowerOfTwo && !(_(T) && _(M))) continue;
      const U = P.transcoderFormat[w ? 1 : 0],
        O = P.engineFormat[w ? 1 : 0],
        N = P.engineType[0];
      return {
        transcoderFormat: U,
        engineFormat: O,
        engineType: N
      };
    }
    throw new Error("THREE.KTX2Loader: Failed to identify transcoding target.");
  }
  function _(b) {
    return b <= 2 ? !0 : (b & b - 1) === 0 && b !== 0;
  }
  function x(b) {
    if (b.length === 1) return b[0];
    let T = 0;
    for (let D = 0; D < b.length; D++) {
      const R = b[D];
      T += R.byteLength;
    }
    const M = new Uint8Array(T);
    let w = 0;
    for (let D = 0; D < b.length; D++) {
      const R = b[D];
      M.set(R, w), w += R.byteLength;
    }
    return M;
  }
};
}
