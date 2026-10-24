/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 948388:948607.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1566(scope) {
scope.saturation_default = "vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){vec3 xHSL=RGBToHSL(x.rgb);vec3 yHSL=RGBToHSL(y.rgb);vec3 z=HSLToRGB(vec3(xHSL.x,yHSL.y,xHSL.z));return mix(x,vec4(z,y.a),opacity);}";
}
