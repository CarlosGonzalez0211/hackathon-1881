/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 401824:401927.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0910(scope) {
scope.premultiplied_alpha_fragment = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`;
}
