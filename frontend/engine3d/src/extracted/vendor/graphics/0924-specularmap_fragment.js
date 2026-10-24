/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 418317:418531.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0924(scope) {
scope.specularmap_fragment = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`;
}
