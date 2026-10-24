/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 946094:946300.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1552(scope) {
scope.hue_default = "vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){vec3 xHSL=RGBToHSL(x.rgb);vec3 yHSL=RGBToHSL(y.rgb);vec3 z=HSLToRGB(vec3(yHSL.x,xHSL.yz));return mix(x,vec4(z,y.a),opacity);}";
}
