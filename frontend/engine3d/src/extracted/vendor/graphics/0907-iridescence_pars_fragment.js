/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 398699:398886.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0907(scope) {
scope.iridescence_pars_fragment = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`;
}
