/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 527580:527809.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1081(scope) {
scope.generateVertexExtensions = function generateVertexExtensions(r) {
  return [r.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "", r.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""].filter(scope.filterEmptyLine).join(`
`);
};
}
