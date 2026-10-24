/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 402227:402324.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0912(scope) {
scope.dithering_fragment = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`;
}
