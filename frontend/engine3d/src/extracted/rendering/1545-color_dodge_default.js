/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 944937:945161.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1545(scope) {
scope.color_dodge_default = "vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){vec3 a=x.rgb,b=y.rgb;vec3 z=step(0.0,a)*mix(min(vec3(1.0),a/max(1.0-b,1e-9)),vec3(1.0),step(1.0,b));return mix(x,vec4(z,y.a),opacity);}";
}
