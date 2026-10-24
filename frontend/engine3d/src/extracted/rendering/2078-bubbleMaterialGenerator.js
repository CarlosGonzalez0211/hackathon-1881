/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1660768:1663164.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2078(scope) {
scope.bubbleMaterialGenerator = function bubbleMaterialGenerator() {
  const r = new scope.ShaderMaterial({
    uniforms: {
      uSize: {
        value: new scope.Vector2(1, 1)
      },
      uColor: {
        value: new scope.Color("#ffffff")
      },
      uRand: {
        value: Math.random()
      }
    },
    vertexShader: `
            attribute float pointer;

            ${scope.matrixutils_default}

            uniform vec2 uSize;

            varying vec2 vUv;
            varying vec3 vLocalPos;
            flat varying float vPointer;
            varying vec2 vHighPrecisionZW;

            void main() {
                vUv = uv;
                vPointer = pointer;

                vec3 pos = position;
                if (pointer < 0.5) pos.xy *= uSize; // big part
                else pos.xy *= 0.7; // smaller pointer

                pos.y += 0.04; // compensate for pointer
                pos.z -= 0.005; // move behind of texts

                vLocalPos = pos;

                gl_Position = projectionMatrix * viewMatrix * billboardModelMatrix() * vec4(pos, 1.0);
                vHighPrecisionZW = gl_Position.zw;
            }
        `,
    fragmentShader: `
            layout(location = 1) out highp vec4 gInfo;

            uniform vec2 uSize;
            uniform vec3 uColor;
            uniform float uRand;

            ${scope.sinenoise_default}

            varying vec2 vUv;
            varying vec3 vLocalPos;
            flat varying float vPointer;
            varying vec2 vHighPrecisionZW;

            float sdRoundedBox(vec2 p, vec2 b, float r) {
                vec2 q = abs(p) - b + r;
                return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
            }

            void main() {
                if (vPointer < 0.5) {
                    vec2 aspectMult = mix(vec2(uSize.x / uSize.y, 1.0), vec2(1.0, uSize.y / uSize.x), step(uSize.x, uSize.y));
                    float shape = sdRoundedBox((vUv - 0.5) * aspectMult, vec2(0.5) * aspectMult, 0.025 / min(uSize.x, uSize.y));
                    if (shape > 0.001) discard;
                }

                float noise = sinenoise1(vec3(vLocalPos.xy * 15.0 + uRand * vec2(2.43, 4.453), uRand * 15.342));
                float onlineContribution = step(-0.3, noise);

                gl_FragColor = vec4(uColor, uRand);
                gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), vec2(0.0), onlineContribution);
            }
        `
  });
  return () => r;
};
}
