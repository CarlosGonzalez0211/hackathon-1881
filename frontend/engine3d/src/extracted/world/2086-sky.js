/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1676078:1678934.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2086(scope) {
scope.sky = class sky {
  constructor(e, i = {}) {
    this.scene = e, this.options = i, this.lastRotation = new scope.Quaternion(), this.currentRotation = new scope.Quaternion().setFromAxisAngle(scope._v0$5.set(0, 0, 1), Math.PI * .5), this.PARALLAX_AMOUNT = .9, this.ready = new Promise(s => {
      this.isReady = s;
    }), this.init();
  }
  init() {
    this.mesh = new scope.Mesh(new scope.SphereGeometry(55, 32, 32), new scope.ShaderMaterial({
      userData: {
        hotReload: "sky"
      },
      uniformsGroups: [scope.global$1.UBO],
      uniforms: {
        uColor1: {
          value: new scope.Color("#75bdc3")
        },
        uColor2: {
          value: new scope.Color("#9fe2e0")
        },
        uColor3: {
          value: new scope.Color("#b9ebea")
        },
        tCloudNoise: {
          value: scope.textureLoader.load("clouds_noise_512.ktx2", "srgb-repeat")
        }
      },
      vertexShader: `
                varying vec2 vHighPrecisionZW;
                varying vec2 vUv;
                void main() {
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    vHighPrecisionZW = gl_Position.zw;
                    vUv = uv;
                }
            `,
      fragmentShader: `
                ${scope.globalUBO_default}

                layout(location = 1) out highp vec4 gInfo;

                varying vec2 vHighPrecisionZW;
                varying vec2 vUv;
                uniform sampler2D tCloudNoise;
                uniform vec3 uColor1;
                uniform vec3 uColor2;
                uniform vec3 uColor3;

                void main() {
                    vec2 screenUv = gl_FragCoord.xy / resolution;

                    float t = time * 0.0005;

                    vec2 uv = vUv * 1.0;

                    // main cloud shape
                    float noise = texture2D(tCloudNoise, uv * vec2(1.0, 2.0) + vec2(t)).r;
                    noise *= texture2D(tCloudNoise, uv * vec2(1.0, 2.0)).r;

                    // hide weirdness at poles
                    noise *= smoothstep(0.1, 0.2, 1.0 - abs(vUv.y - 0.5) * 2.0);

                    // if (noise < 0.15) discard;

                    float blend = step(0.27, noise);
                    float id = mix(0.01, 1.0, blend);
                    vec3 cloudColor = mix(uColor3, uColor2, screenUv.y);
                    vec3 color = mix(uColor1, cloudColor, blend);

                    gl_FragColor = vec4(color, id);
                    gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), vec2(0.0), 1.0);
                }
            `,
      side: scope.BackSide
    })), this.mesh.name = "sky", this.mesh.rotation.x = 1, this.scene.add(this.mesh), this.isReady();
  }
  update() {
    const e = this.scene.characters.mesh._localObject;
    scope._q0.copy(e.quaternion).premultiply(scope._q1.setFromAxisAngle(e.up, Math.PI - e.rotationHorizontal)), this.mesh.quaternion.copy(scope._q0), scope._q1.copy(scope._q0).invert().multiply(this.lastRotation), this.lastRotation.copy(scope._q0), scope._q0.copy(this.currentRotation).premultiply(scope._q1), this.currentRotation.slerp(scope._q0, this.PARALLAX_AMOUNT), this.mesh.quaternion.multiply(this.currentRotation);
  }
};
}
