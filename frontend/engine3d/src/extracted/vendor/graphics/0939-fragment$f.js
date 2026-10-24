/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 438843:439195.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0939(scope) {
scope.fragment$f = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`;
}
