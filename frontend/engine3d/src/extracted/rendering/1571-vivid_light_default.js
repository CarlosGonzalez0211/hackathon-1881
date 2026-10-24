/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 949316:949547.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1571(scope) {
scope.vivid_light_default = "vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){vec3 z=mix(max(1.0-min((1.0-x.rgb)/(2.0*y.rgb),1.0),0.0),min(x.rgb/(2.0*(1.0-y.rgb)),1.0),step(0.5,y.rgb));return mix(x,vec4(z,y.a),opacity);}";
}
