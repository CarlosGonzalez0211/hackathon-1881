/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 506543:507082.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1000(scope) {
scope._getCubemapMaterial = function _getCubemapMaterial() {
  return new scope.ShaderMaterial({
    name: "CubemapToCubeUV",
    uniforms: {
      envMap: {
        value: null
      },
      flipEnvMap: {
        value: -1
      }
    },
    vertexShader: scope._getCommonVertexShader(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,
    blending: scope.NoBlending,
    depthTest: !1,
    depthWrite: !1
  });
};
}
