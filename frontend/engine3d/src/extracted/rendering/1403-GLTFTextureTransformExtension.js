/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 861281:861721.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1403(scope) {
scope.GLTFTextureTransformExtension = class GLTFTextureTransformExtension {
  constructor() {
    this.name = scope.EXTENSIONS.KHR_TEXTURE_TRANSFORM;
  }
  extendTexture(e, i) {
    return (i.texCoord === void 0 || i.texCoord === e.channel) && i.offset === void 0 && i.rotation === void 0 && i.scale === void 0 || (e = e.clone(), i.texCoord !== void 0 && (e.channel = i.texCoord), i.offset !== void 0 && e.offset.fromArray(i.offset), i.rotation !== void 0 && (e.rotation = i.rotation), i.scale !== void 0 && e.repeat.fromArray(i.scale), e.needsUpdate = !0), e;
  }
};
}
