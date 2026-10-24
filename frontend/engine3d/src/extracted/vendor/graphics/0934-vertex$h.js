/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 436845:437009.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0934(scope) {
scope.vertex$h = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`;
}
