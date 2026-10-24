/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 443106:443425.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0945(scope) {
scope.fragment$c = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`;
}
