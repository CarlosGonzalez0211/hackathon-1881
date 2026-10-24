/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 391426:391662.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0887(scope) {
scope.map_fragment = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`;
}
