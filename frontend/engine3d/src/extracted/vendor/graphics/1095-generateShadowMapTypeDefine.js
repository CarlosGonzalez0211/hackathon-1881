/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 530935:531187.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1095(scope) {
scope.generateShadowMapTypeDefine = function generateShadowMapTypeDefine(r) {
  let e = "SHADOWMAP_TYPE_BASIC";
  return r.shadowMapType === scope.PCFShadowMap ? e = "SHADOWMAP_TYPE_PCF" : r.shadowMapType === scope.PCFSoftShadowMap ? e = "SHADOWMAP_TYPE_PCF_SOFT" : r.shadowMapType === scope.VSMShadowMap && (e = "SHADOWMAP_TYPE_VSM"), e;
};
}
