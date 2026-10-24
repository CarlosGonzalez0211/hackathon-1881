/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 505962:506543.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0999(scope) {
scope._getEquirectMaterial = function _getEquirectMaterial() {
  return new scope.ShaderMaterial({
    name: "EquirectangularToCubeUV",
    uniforms: {
      envMap: {
        value: null
      }
    },
    vertexShader: scope._getCommonVertexShader(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,
    blending: scope.NoBlending,
    depthTest: !1,
    depthWrite: !1
  });
};
}
