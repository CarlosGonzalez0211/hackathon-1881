/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1857457:1859234.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2142(scope) {
scope.dot = class dot {
  constructor(e) {
    this.scene = e, this.shown = !1, this.init();
  }
  init() {
    this.mesh = new scope.Mesh(new scope.PlaneGeometry(1, 1), new scope.ShaderMaterial({
      uniforms: {
        uColor: {
          value: new scope.Color("#d85656")
        },
        uShow: {
          value: scope.client$1.devScene ? 1 : 0
        },
        uSideShow: {
          value: scope.client$1.devScene ? 1 : 0
        }
      },
      vertexShader: `
                varying vec2 vUv;

                uniform float uShow;
                uniform float uSideShow;

                void main() {
                    vUv = uv;

                    float show = uShow * uSideShow;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * vec3(vec2(show), 1.0), 1.0);
                }
            `,
      fragmentShader: `
                varying vec2 vUv;

                uniform vec3 uColor;

                void main() {
                    if (length(vUv - 0.5) > 0.5) discard;

                    gl_FragColor = vec4(uColor, 1.0);
                }
            `,
      depthWrite: !1,
      depthTest: !1
    })), this.mesh.frustumCulled = !1, this.mesh.name = "Checklist Red Dot", this.mesh.renderOrder = 100, this.mesh.visible = !!scope.client$1.devScene, this.mesh.matrixAutoUpdate = !1, this.scene.add(this.mesh), this.shown = this.mesh.visible, scope.events$1.on("ui_sideicons_hidden", this.sideHide, this), scope.events$1.on("ui_sideicons_shown", this.sideShow, this);
  }
  sideShow() {
    scope.createTween(this.mesh.material.uniforms.uSideShow, {
      to: {
        value: 1
      },
      duration: .1,
      delay: .4
    });
  }
  sideHide() {
    scope.createTween(this.mesh.material.uniforms.uSideShow, {
      to: {
        value: 0
      },
      duration: .1,
      delay: .2
    });
  }
  show() {
    this.shown || (this.shown = !0, scope.createTween(this.mesh.material.uniforms.uShow, {
      to: {
        value: 1
      },
      duration: .3,
      delay: 1,
      onStart: () => {
        this.mesh.visible = !0;
      }
    }));
  }
  hide() {
    this.shown && (this.shown = !1, scope.createTween(this.mesh.material.uniforms.uShow, {
      to: {
        value: 0
      },
      duration: .2,
      onComplete: () => {
        this.mesh.visible = !1;
      }
    }));
  }
};
}
