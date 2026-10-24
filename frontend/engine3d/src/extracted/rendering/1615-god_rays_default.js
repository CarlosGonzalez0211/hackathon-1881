/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1001916:1002156.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1615(scope) {
scope.god_rays_default = `#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D map;
#else
uniform lowp sampler2D map;
#endif
void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){outputColor=texture2D(map,uv);}`;
}
