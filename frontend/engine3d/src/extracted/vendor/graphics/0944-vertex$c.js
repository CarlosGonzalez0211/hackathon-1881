/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 442909:443105.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0944(scope) {
scope.vertex$c = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`;
}
