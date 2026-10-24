/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 391256:391425.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0886(scope) {
scope.logdepthbuf_vertex = `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`;
}
