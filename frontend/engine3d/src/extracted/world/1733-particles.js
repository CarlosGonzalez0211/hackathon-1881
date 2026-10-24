/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1299405:1303839.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1733(scope) {
scope.particles = class particles {
  constructor(e) {
    this.scene = e, this.ready = new Promise(i => {
      this.isReady = i;
    }), this.init();
  }
  async init() {
    const e = await scope.geometryLoader.load("/planets/intro/points.drc"),
      i = new scope.ShaderMaterial({
        uniformsGroups: [scope.global$1.UBO],
        uniforms: {
          tSprites: {
            value: scope.textureLoader.load("particle_sprites.ktx2", "srgb-repeat")
          },
          uColor: {
            value: new scope.Color("#6a8f89")
          },
          uShow1: {
            value: 0
          }
        },
        vertexShader: `
                ${scope.globalUBO_default}
                ${scope.fit_default}
                ${scope.rotate_default}
                ${scope.falloff_default}

                attribute vec3 color;

                uniform float uShow1;

                varying vec3 vNoise;
                varying float vProgress;
                varying float vRotation;
                varying float vSize;
                varying vec2 vHighPrecisionZW;

                void main() {
                    vNoise = color;

                    float steppedTime = floor(time * 2.0) / 2.0;
                    vec3 pos = position;

                    vRotation = sin(steppedTime + vNoise.r * 20.0) * 3.14 * vNoise.g;
                    pos.y += vRotation * 0.1;

                    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);

                    vProgress = fract(vNoise.g * 20.0);
                    vProgress = floor(vProgress * 16.0) / 16.0;
                    vProgress = clamp(vProgress, 0.0, 1.0);

                    vSize = vNoise.b;
                    if (vSize > 0.5) {
                        vSize *= 2.0;
                    }

                    gl_Position = projectionMatrix * mvPos;
                    vHighPrecisionZW = gl_Position.zw;

                    gl_PointSize = (resolution.y / mix(70.0, 50.0, vSize)) * uShow1;
                }
            `,
        fragmentShader: `
                layout(location = 1) out highp vec4 gInfo;

                ${scope.globalUBO_default}
                ${scope.falloff_default}

                varying vec3 vNoise;
                varying float vProgress;
                varying float vRotation;
                varying float vSize;
                varying vec2 vHighPrecisionZW;

                uniform sampler2D tSprites;
                uniform vec3 uColor;
                uniform float uShow1;

                mat2 rotate(float a) {
                    float s = sin(a);
                    float c = cos(a);
                    mat2 m = mat2(c, s, -s, c);
                    return m;
                }

                void main() {
                    vec2 uv = gl_PointCoord.xy;

                    // randomize sprite rotation
                    uv -= 0.5;
                    uv = rotate(vRotation) * uv;
                    uv += 0.5;

                    // scale uvs to match a single character of the spritesheet
                    uv.y = 1.0 - uv.y;
                    uv.x /= 16.0;
                    uv.x += 1.0 / 16.0;

                    // choose random sprite from spritesheet
                    uv.x += vProgress;

                    float sprite = texture2D(tSprites, uv).r;
                    float alpha = sprite;
                    if (alpha < 0.5) discard;

                    alpha *= smoothstep(0.0, 0.1, uShow1);

                    vec3 color = mix(uColor + uColor * 0.5, uColor * uColor, vNoise.r);

                    float outlineContribution = 0.0;
                    float depth = 1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5);

                    if (vSize > 1.5) {
                        outlineContribution = 0.1;
                        depth = 0.1; // overwrite to ignore outline fading on distance
                    }

                    gl_FragColor = vec4(color, alpha);
                    gInfo = vec4(depth, 0.0, 0.0, outlineContribution);
                }
            `,
        transparent: !0,
        blending: scope.CustomBlending,
        blendSrc: scope.SrcAlphaFactor,
        blendSrcAlpha: scope.ZeroFactor,
        blendDst: scope.OneFactor,
        blendDstAlpha: scope.OneFactor
      });
    this.mesh = new scope.Points(e, i), this.mesh.name = "stars", this.mesh.renderOrder = 1, this.mesh.receiveShadow = !1, this.mesh.castShadow = !1, this.mesh.frustumCulled = !1, this.scene.add(this.mesh), this.isReady();
  }
  playInAnimation(e = 0) {
    scope.createTween(this.mesh.material.uniforms.uShow1, {
      from: {
        value: 0
      },
      to: {
        value: 1
      },
      duration: 2,
      delay: e,
      ease: "sine.inOut"
    }), this.mesh.rotation.y = -Math.PI * .75, scope.createTween(this.mesh.rotation, {
      to: {
        y: 0
      },
      duration: 4,
      delay: e + .5,
      ease: "inOut3"
    });
  }
};
}
