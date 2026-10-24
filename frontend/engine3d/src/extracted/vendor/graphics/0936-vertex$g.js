/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 437530:437759.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0936(scope) {
scope.vertex$g = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`;
}
