/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 438613:438842.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0938(scope) {
scope.vertex$f = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`;
}
