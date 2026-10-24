/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 342002:342202.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0848(scope) {
scope.color_pars_vertex = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`;
}
