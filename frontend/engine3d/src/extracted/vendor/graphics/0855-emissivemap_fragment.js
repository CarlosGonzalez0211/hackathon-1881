/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 350141:350407.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0855(scope) {
scope.emissivemap_fragment = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`;
}
