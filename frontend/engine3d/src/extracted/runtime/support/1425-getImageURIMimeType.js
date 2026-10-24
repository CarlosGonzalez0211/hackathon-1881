/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 866250:866533.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1425(scope) {
scope.getImageURIMimeType = function getImageURIMimeType(r) {
  return r.search(/\.jpe?g($|\?)/i) > 0 || r.search(/^data\:image\/jpeg/) === 0 ? "image/jpeg" : r.search(/\.webp($|\?)/i) > 0 || r.search(/^data\:image\/webp/) === 0 ? "image/webp" : r.search(/\.ktx2($|\?)/i) > 0 || r.search(/^data\:image\/ktx2/) === 0 ? "image/ktx2" : "image/png";
};
}
