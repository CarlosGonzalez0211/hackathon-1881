/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 156863:156972.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0521(scope) {
scope.default_vertex = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;
}
