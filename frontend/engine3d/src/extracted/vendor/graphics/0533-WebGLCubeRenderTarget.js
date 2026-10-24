/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 164829:166602.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0533(scope) {
scope.WebGLCubeRenderTarget = class WebGLCubeRenderTarget extends scope.WebGLRenderTarget {
  constructor(e = 1, i = {}) {
    super(e, e, i), this.isWebGLCubeRenderTarget = !0;
    const s = {
        width: e,
        height: e,
        depth: 1
      },
      a = [s, s, s, s, s, s];
    this.texture = new scope.CubeTexture(a), this._setTextureOptions(i), this.texture.isRenderTargetTexture = !0;
  }
  fromEquirectangularTexture(e, i) {
    this.texture.type = i.type, this.texture.colorSpace = i.colorSpace, this.texture.generateMipmaps = i.generateMipmaps, this.texture.minFilter = i.minFilter, this.texture.magFilter = i.magFilter;
    const s = {
        uniforms: {
          tEquirect: {
            value: null
          }
        },
        vertexShader: `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,
        fragmentShader: `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`
      },
      a = new scope.BoxGeometry(5, 5, 5),
      o = new scope.ShaderMaterial({
        name: "CubemapFromEquirect",
        uniforms: scope.cloneUniforms(s.uniforms),
        vertexShader: s.vertexShader,
        fragmentShader: s.fragmentShader,
        side: scope.BackSide,
        blending: scope.NoBlending
      });
    o.uniforms.tEquirect.value = i;
    const l = new scope.Mesh(a, o),
      c = i.minFilter;
    return i.minFilter === scope.LinearMipmapLinearFilter && (i.minFilter = scope.LinearFilter), new scope.CubeCamera(1, 10, this).update(e, l), i.minFilter = c, l.geometry.dispose(), l.material.dispose(), this;
  }
  clear(e, i = !0, s = !0, a = !0) {
    const o = e.getRenderTarget();
    for (let l = 0; l < 6; l++) e.setRenderTarget(this, l), e.clear(i, s, a);
    e.setRenderTarget(o);
  }
};
}
