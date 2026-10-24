/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1273808:1286228.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1725(scope) {
scope.waterfall = class waterfall {
  constructor(e, i = {}) {
    this.scene = e, this.options = i, this.ready = new Promise(s => {
      this.isReady = s;
    }), this.init();
  }
  async init() {
    const [e, i, s] = await Promise.all([scope.geometryLoader.load("./planets/present/waterfall_vfx.drc"), scope.geometryLoader.load("./planets/present/waterfallsplash_vfx.drc"), scope.geometryLoader.load("./planets/present/waterfall_inlet_vfx.drc")]);
    this.mesh = new scope.PlanetMesh(e, new scope.ShaderMaterial({
      userData: {
        hotReload: "waterfallvfx"
      },
      uniformsGroups: [scope.global$1.UBO],
      uniforms: {
        uColor1: {
          value: new scope.Color("#739fb1")
        },
        uColor2: {
          value: new scope.Color("#376f74")
        },
        uColor3: {
          value: new scope.Color("#afe7eb")
        },
        tNoise: {
          value: scope.textureLoader.load("water-noises-highq.ktx2", "linearfilter-repeat")
        },
        tNoise2: {
          value: scope.textureLoader.load("noise-simplex-layered-blur-highq.ktx2", "linearfilter-repeat")
        },
        tNoise3: {
          value: scope.textureLoader.load("clouds_noise_64.ktx2", "linearfilter-repeat")
        },
        ...scope.fogUniforms
      },
      vertexShader: `
                ${scope.globalUBO_default}


                attribute float scalefactor;

                varying vec2 vHighPrecisionZW;
                varying vec2 vUv;
                varying vec2 vUv2;
                varying float vScaleFactor;
                varying vec3 vLocalPos;
                varying vec4 vPos;

                uniform sampler2D tNoise;

                void main() {
                    vLocalPos = position;

                    // vec2 displacementUv = uv;
                    // displacementUv.y *= 0.08;
                    // displacementUv * vec2(1.0, 0.5 + displacementUv.y * 0.5);
                    // displacementUv.y += time * 0.085;

                    // float n1 = texture2D(tNoise, displacementUv).r;

                    // float grad = 1.0 - abs(n1 - 0.5) * 2.0;
                    // grad = step(0.95, grad);

                    // vec3 pos = position + normal * grad * 0.03 * (1.0 - scalefactor * 1.75);
                    vec3 pos = position;

                    vPos = modelViewMatrix * vec4(pos, 1.0);

                    gl_Position = projectionMatrix * vPos;
                    vHighPrecisionZW = gl_Position.zw;
                    vUv = uv;
                    vUv2 = uv;
                    vScaleFactor = scalefactor;
                }
            `,
      fragmentShader: `
                ${scope.globalUBO_default}
                ${scope.aastep_default}
                ${scope.fog_default}

                layout(location = 1) out highp vec4 gInfo;

                varying vec2 vHighPrecisionZW;
                varying vec2 vUv;
                varying vec2 vUv2;
                varying float vScaleFactor;
                varying vec3 vLocalPos;
                varying vec4 vPos;

                uniform sampler2D tNoise;
                uniform sampler2D tNoise2;
                uniform sampler2D tNoise3;
                uniform vec3 uColor1;
                uniform vec3 uColor2;
                uniform vec3 uColor3;

                void main() {

                    vec3 off = vLocalPos * 0.025;

                    vec2 uv = vUv;
                    uv.y *= 0.08;

                    uv.y += time * 0.04;

                    float n1 = texture2D(tNoise, vec2(uv.x * (0.5 - vScaleFactor * 0.3) + time * 0.01, uv.y + vScaleFactor * 0.25)).r; // foam
                    float n2 = texture2D(tNoise2, vUv * vec2(0.5, 0.1) + vec2(off.x, time * 0.05)).g;
                    n2 -= texture2D(tNoise2, vUv * vec2(2.0 - vScaleFactor * 2.0, 0.15) + vec2(off.z, time * 0.031)).g;
                    float n3 = texture2D(tNoise2, vUv * vec2(0.5, 0.5 + vUv.y * 0.25) + vec2(-off.x, time * 0.3)).r;

                    float n4 = 1.0 - texture2D(tNoise3, vUv * vec2(0.5, 0.5) - vec2(time * 0.02 - off.z, time * 0.11)).r;
                    n4 = 1.0 - pow(1.0 - n4, 2.0);

                    float edgegrad = 1.0 - abs(vUv.x - 0.5) * 2.0;
                    edgegrad -= n3 * 0.2;

                    float edgemask = 1.0 - aastep(0.125 + vScaleFactor * 0.25, edgegrad);

                    // streaks
                    float streaks = 1.0 - abs(n1 - 0.5) * 2.0;
                    streaks = streaks * streaks * streaks;
                    streaks = aastep(0.5, streaks);

                    // foam near ground
                    float foam = vUv.y - n4 * 0.04;
                    float foammask = 1.0 - step(0.002, foam);

                    if (edgegrad < 0.05) discard;

                    // stylized specular shine
                    float shine1 = 1.0 - clamp(abs(vUv.y - 0.6) * 4.0, 0.0, 1.0);
                    shine1 = 1.0 - pow(1.0 - shine1, 2.0);
                    shine1 -= n2 * 0.06;
                    shine1 = aastep(0.97, shine1);

                    // another specular shine
                    float shine2 = 1.0 - clamp(abs(vUv.y - 0.3) * 4.0, 0.0, 1.0);
                    shine2 = 1.0 - pow(1.0 - shine2, 2.0);
                    shine2 -= n2 * 0.2;
                    shine2 = aastep(0.91, shine2 - 0.05);

                    // darker color near base of waterfall
                    float shadow = vUv.y - n2 * 0.25;
                    shadow = 1.0 - aastep(0.275, shadow);

                    // composite all effects together
                    vec3 color = uColor1;
                    color = mix(color, uColor3, max(shine1, shine2));
                    color = mix(color, uColor2, shadow);
                    color = mix(color, vec3(1.0), max(streaks, edgemask));
                    color = mix(color, vec3(1.0), foammask);

                    gl_FragColor = vec4(color, 1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5));
                    gInfo = vec4(1.0, vec2(0.0), 0.0);

                }
            `,
      side: scope.DoubleSide
    }), this.scene, 25), this.mesh.name = "waterfallvfx", this.scene.planetGroup.add(this.mesh), this.mesh2 = new scope.PlanetMesh(i, new scope.ShaderMaterial({
      userData: {
        hotReload: "waterfallsplashvfx"
      },
      uniformsGroups: [scope.global$1.UBO],
      uniforms: {
        uColor1: {
          value: new scope.Color("#79adbd")
        },
        uColor2: {
          value: new scope.Color("#4a7683")
        },
        uColor3: {
          value: new scope.Color("#afe7eb")
        },
        tNoise: {
          value: scope.textureLoader.load("water-noises-highq.ktx2", "linearfilter-repeat")
        },
        tNoise2: {
          value: scope.textureLoader.load("noise-simplex-layered-pixellated-highq.ktx2", "linearfilter-repeat")
        },
        tNoise3: {
          value: scope.textureLoader.load("clouds_noise_64.ktx2", "linearfilter-repeat")
        },
        ...scope.fogUniforms
      },
      vertexShader: `
                ${scope.globalUBO_default}

                varying vec2 vHighPrecisionZW;
                varying vec2 vUv;
                varying vec4 vPos;

                void main() {
                    vPos = modelViewMatrix * vec4(position, 1.0);

                    gl_Position = projectionMatrix * vPos;
                    vHighPrecisionZW = gl_Position.zw;
                    vUv = uv;
                }
            `,
      fragmentShader: `
                ${scope.globalUBO_default}
                ${scope.aastep_default}
                ${scope.fog_default}

                layout(location = 1) out highp vec4 gInfo;

                varying vec2 vHighPrecisionZW;
                varying vec2 vUv;
                varying vec4 vPos;

                uniform sampler2D tNoise;
                uniform sampler2D tNoise2;
                uniform sampler2D tNoise3;
                uniform vec3 uColor1;
                uniform vec3 uColor2;
                uniform vec3 uColor3;

                void main() {

                    vec2 uv = vUv * vec2(1.0, 5.0);
                    uv.x = pow(uv.x, 2.0);

                    // animated texture
                    float mask1 = texture2D(tNoise, uv + vec2(-time * 0.2, 0.0)).r;

                    // concentric rings that animate outwards
                    float concentric = sin(uv.x * 25.0 - time * 5.0) * 0.5 + 0.5;

                    // foam pattern that animates outwards
                    float foam = mask1 * 0.65;
                    foam += 0.3 * (pow(concentric, 20.0));
                    foam += pow(1.0 - vUv.x, 3.0);
                    foam *= 1.0 - pow(smoothstep(0.2, 1.0, vUv.x), 3.0);

                    float alpha = step(0.5, foam);
                    if (alpha < 0.5) discard;

                    vec3 color = vec3(1.0);

                    gl_FragColor = vec4(color, 1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5));
                    gInfo = vec4(1.0, vec2(0.0), 0.0);

                }
            `
    }), this.scene, 25), this.mesh2.name = "waterfallsplashvfx", this.scene.planetGroup.add(this.mesh2), this.mesh3 = new scope.PlanetMesh(s, new scope.ShaderMaterial({
      userData: {
        hotReload: "waterfallinletvfx"
      },
      uniformsGroups: [scope.global$1.UBO],
      uniforms: {
        uColor1: {
          value: new scope.Color("#6695a7")
        },
        uColor2: {
          value: new scope.Color("#486c81")
        },
        uColor3: {
          value: new scope.Color("#afe7eb")
        },
        tNoise: {
          value: scope.textureLoader.load("water-noises-highq.ktx2", "linearfilter-repeat")
        },
        tNoise2: {
          value: scope.textureLoader.load("noise-simplex-layered-pixellated-highq.ktx2", "linearfilter-repeat")
        },
        tNoise3: {
          value: scope.textureLoader.load("clouds_noise_64.ktx2", "linearfilter-repeat")
        },
        ...scope.fogUniforms
      },
      vertexShader: `
                ${scope.globalUBO_default}

                attribute vec2 uv2;
                attribute float extrafoam;

                varying vec2 vHighPrecisionZW;
                varying vec2 vUv;
                varying vec2 vUv2;
                varying float vExtraFoam;
                varying vec4 vPos;

                void main() {
                    vPos = modelViewMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * vPos;
                    vHighPrecisionZW = gl_Position.zw;
                    vUv = uv;
                    vUv2 = uv2;
                    vExtraFoam = extrafoam;
                }
            `,
      fragmentShader: `
                ${scope.globalUBO_default}
                ${scope.aastep_default}
                ${scope.fog_default}

                layout(location = 1) out highp vec4 gInfo;

                varying vec2 vHighPrecisionZW;
                varying vec2 vUv;
                varying vec2 vUv2;
                varying float vExtraFoam;
                varying vec4 vPos;

                uniform sampler2D tNoise;
                uniform sampler2D tNoise2;
                uniform sampler2D tNoise3;
                uniform vec3 uColor1;
                uniform vec3 uColor2;
                uniform vec3 uColor3;

                void main() {

                    // vec2 uv = vUv * vec2(1.0, 5.0);
                    // uv.x = pow(uv.x, 2.0);

                    float foam = texture2D(tNoise, vUv * vec2(0.5, 2.0) + vec2(0.5, time * 0.1)).r;
                    float foam2 = texture2D(tNoise, vUv * vec2(0.5, 2.0) * 2.0 + vec2(0.0, time * 0.09)).r;
                    float edges = smoothstep(0.3, 0.0, vUv.x) + smoothstep(0.8, 1.0, vUv.x);

                    // // concentric rings that animate outwards
                    // float concentric = sin(uv.x * 25.0 - time * 3.0) * 0.5 + 0.5;

                    // // foam pattern that animates outwards
                    // float foam = mask1 * 0.65;
                    // foam += 0.3 * (pow(concentric, 20.0));
                    // foam += pow(1.0 - vUv.x, 3.0);
                    // foam *= 1.0 - pow(smoothstep(0.2, 1.0, vUv.x), 3.0);

                    // float alpha = step(0.5, foam);
                    // if (alpha < 0.5) discard;

                    float value = max(foam, edges);
                    value = max(value, smoothstep(0.2, 0.0, vUv.y) - foam2 * 0.1 + vExtraFoam * foam2 * 1.5);
                    value = step(0.7, value);

                    // composite all effects together
                    vec3 color = uColor1;
                    color = mix(uColor1, uColor2, step(0.4, smoothstep(0.425, 0.6, vUv.y) - foam2 * 0.1));
                    color = mix(color, vec3(1.0), value);

                    float n2 = texture2D(tNoise2, vUv * vec2(0.55, 1.0) + vec2(0.0, time * 0.04)).g;
                    float alpha = smoothstep(0.0, 0.05, vUv.y) - foam2 * 0.4;
                    if (alpha < 0.05) discard;

                    gl_FragColor = vec4(color, 1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5));
                    gInfo = vec4(1.0, vec2(0.0), 0.0);

                }
            `
    }), this.scene, 25), this.mesh3.name = "waterfallinletvfx", this.scene.planetGroup.add(this.mesh3), this.isReady();
  }
};
}
