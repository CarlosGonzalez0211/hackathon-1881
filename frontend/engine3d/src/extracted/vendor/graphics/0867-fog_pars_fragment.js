/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 354247:354456.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0867(scope) {
scope.fog_pars_fragment = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`;
}
