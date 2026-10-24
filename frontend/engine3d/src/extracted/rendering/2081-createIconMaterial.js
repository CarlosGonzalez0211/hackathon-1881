/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1667234:1671274.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2081(scope) {
scope.createIconMaterial = function createIconMaterial(r) {
  return new scope.ShaderMaterial({
    userData: {
      hotReload: "npc-icon"
    },
    uniformsGroups: [scope.global$1.UBO],
    uniforms: {
      uColor1: {
        value: new scope.Color()
      },
      uColor2: {
        value: new scope.Color()
      },
      tBand: {
        value: null
      },
      tCurve: {
        value: null
      },
      uShowDistance: {
        value: 1
      },
      uScale: {
        value: 1
      },
      uShow: {
        value: 1
      },
      uPulse: {
        value: 0
      },
      uActive: {
        value: r === "active" ? 1 : 0
      },
      uWiggleDir: {
        value: new scope.Vector3(0, 1, 0)
      },
      uRand: {
        value: Math.random()
      }
    },
    vertexShader: `
            ${scope.globalUBO_default}
            ${scope.matrixutils_default}
            ${scope.slugvs_default}

            varying vec2 vUv;
            varying vec3 vLocalPos;
            varying vec2 vHighPrecisionZW;

            uniform float uShowDistance;
            uniform float uScale;
            uniform float uShow;
            uniform float uPulse;
            uniform vec3 uWiggleDir;

            void main() {
                vUv = uv;

                vec3 pos = SlugVS();
                vLocalPos = pos;
                vec3 wPos = (modelMatrix * vec4(pos, 1.0)).xyz;

                float scale = smoothstep(uShowDistance, uShowDistance * 0.8, distance(wPos, cameraPosition)) * uScale * uShow;
                scale = mix(scale, scale * 1.2, uPulse);

                pos *= scale;
                pos += uWiggleDir * (0.05 + 0.05 * sin(time * 4.0));

                gl_Position = projectionMatrix * viewMatrix * billboardModelMatrix() * vec4(pos, 1.0);
                vHighPrecisionZW = gl_Position.zw;
            }
        `,
    fragmentShader: `
            layout(location = 1) out highp vec4 gInfo;

            ${scope.slugfs_default}
            ${scope.sinenoise_default}
            ${scope.globalUBO_default}
            ${scope.parabolas_default}
            ${scope.fit_default}

            varying vec2 vUv;
            varying vec3 vLocalPos;
            varying vec2 vHighPrecisionZW;

            uniform sampler2D tCurve;
            uniform usampler2D tBand;
            uniform vec3 uColor1;
            uniform vec3 uColor2;
            uniform float uRand;

            uniform int uActive;

            void main() {
                vec4 color = RenderSlug(tCurve, tBand, vTexCoord, vColor, vBanding, vGlyph);
                if (color.w * vColor.w < 0.001) discard;

                float onlineContribution = 1.0;
                float rand = uRand;

                if (uActive == 1) {
                    // draw the 3 dots
                    vec2 uv = vUv;

                    uv -= 0.5;
                    uv *= vec2(1.217, 1.0); // fix aspect

                    // add noise in the outline only if active
                    float noise = sinenoise1(vec3(vLocalPos.xy * 15.0 + uRand * vec2(2.43, 4.453), uRand * 15.342));
                    onlineContribution = step(-0.3, noise);

                    // dots
                    const float offsetDist = 0.285;
                    const vec2 offsets[3] = vec2[3](vec2(0.0, 0.0), vec2(-offsetDist, 0.0), vec2(offsetDist, 0.0));
                    vec2 offset;
                    vec2 pos1;
                    float dist1;
                    float cut1;
                    #pragma unroll_loop_start
                    for (int i = 0; i < 3; i++) {
                        offset = offsets[i];
                        pos1 = uv + offset;
                        pos1.y -= parabola(fit(fract(time * 0.5 + uRand + offset.x * 0.15), 0.7, 1.0, 0.0, 1.0), 3.0) * 0.15;
                        dist1 = length(pos1);
                        cut1 = step(0.085, dist1);
                        color.rgb = mix(uColor2, color.rgb, cut1);
                        rand = mix(fract(rand + 2.4235), rand, cut1);
                        onlineContribution = mix(1.0, onlineContribution, cut1);
                    }
                    #pragma unroll_loop_end
                }

                gl_FragColor = vec4(color.rgb, rand);
                gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), vec2(0.0), onlineContribution);
            }
        `
  });
};
}
