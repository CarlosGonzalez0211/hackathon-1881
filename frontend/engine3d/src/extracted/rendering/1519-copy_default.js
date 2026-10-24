/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 925547:925926.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1519(scope) {
scope.copy_default = `#include <common>
#include <dithering_pars_fragment>
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
uniform float opacity;varying vec2 vUv;void main(){vec4 texel=texture2D(inputBuffer,vUv);gl_FragColor=opacity*texel;
#include <colorspace_fragment>
#include <dithering_fragment>
}`;
}
