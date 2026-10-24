/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 418624:418736.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0926(scope) {
scope.tonemapping_fragment = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`;
}
