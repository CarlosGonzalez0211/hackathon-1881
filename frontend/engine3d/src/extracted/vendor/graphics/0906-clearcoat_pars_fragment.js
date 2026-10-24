/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 398404:398698.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0906(scope) {
scope.clearcoat_pars_fragment = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`;
}
