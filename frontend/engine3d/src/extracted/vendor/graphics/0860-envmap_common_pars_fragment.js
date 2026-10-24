/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 352282:352535.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0860(scope) {
scope.envmap_common_pars_fragment = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`;
}
