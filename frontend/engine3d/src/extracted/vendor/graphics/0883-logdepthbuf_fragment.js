/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 390780:390954.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0883(scope) {
scope.logdepthbuf_fragment = `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`;
}
