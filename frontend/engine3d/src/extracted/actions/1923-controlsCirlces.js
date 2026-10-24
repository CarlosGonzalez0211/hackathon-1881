/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1408713:1413776.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1923(scope) {
scope.controlsCirlces = class controlsCirlces extends scope.Group {
  constructor(e) {
    super(), this.name = "PlayerControls UI", this.visible = !0, this.frustumCulled = !1, this.matrixWorldAutoUpdate = !1, this._controls = e, this._touchPosition = new scope.Vector2(), this._touchActive = 0, this._touchScale = 1, this._jumpAnimVar = {
      value: 0
    }, this._createMoveCircle(), this._createJumpCircle();
  }
  _createMoveCircle() {
    const e = new scope.ShaderMaterial({
      uniformsGroups: [scope.global$1.UBO],
      uniforms: {
        tCircles: {
          value: scope.textureLoader.load("controls/circles.avif")
        },
        uInnerPos: {
          value: new scope.Vector2()
        },
        uScale: {
          value: 1
        },
        uAlpha: {
          value: 1
        },
        uSize: {
          value: 430
        }
      },
      vertexShader: `
                ${scope.globalUBO_default}

                uniform float uScale;
                uniform float uSize;
                varying vec2 vUv;

                void main() {
                    vUv = uv;

                    vec3 pos = position;
                    pos.x /= aspect;
                    pos /= resolutionUI.y / (uSize * uScale);

                    gl_Position = modelMatrix * vec4(pos, 1.0);
                }
            `,
      fragmentShader: `
                ${scope.blendmodes_default}

                uniform sampler2D tCircles;
                uniform vec2 uInnerPos;
                uniform float uAlpha;

                varying vec2 vUv;

                void main() {
                    vec2 bg = texture2D(tCircles, vUv).rg;
                    vec4 color = vec4(vec3(mix(vec3(0.0), vec3(1.0), bg.x)), bg.y);

                    float inner = texture2D(tCircles, vUv + uInnerPos).b;
                    color.rgb = blendScreen(color.rgb, vec3(mix(vec3(0.0), vec3(1.0), inner)));
                    color.a = max(color.a, inner * 0.6);

                    gl_FragColor = color;
                    gl_FragColor.a *= uAlpha;
                }
            `,
      transparent: !0,
      depthWrite: !1,
      depthTest: !1
    });
    this._moveCircle = new scope.Mesh(scope.utils.plane, e), this._moveCircle.isCharacterControls = !0, this._moveCircle.name = "Move Circle", this._moveCircle.frustumCulled = !1, this._moveCircle.renderOrder = 99999, this._moveCircle.castShadow = !1, this._moveCircle.receiveShadow = !1, this._moveCircle.visible = !1, this.add(this._moveCircle);
  }
  _createJumpCircle() {
    const e = new scope.ShaderMaterial({
      uniformsGroups: [scope.global$1.UBO],
      uniforms: {
        uScale: {
          value: 1
        },
        uAlpha: {
          value: 1
        }
      },
      vertexShader: `
                ${scope.globalUBO_default}

                uniform float uScale;
                varying vec2 vUv;

                void main() {
                    vUv = uv;

                    vec3 pos = position;
                    pos.x /= aspect;
                    pos /= resolutionUI.y / (300.0 * uScale);

                    gl_Position = modelMatrix * vec4(pos, 1.0);
                }
            `,
      fragmentShader: `
                uniform float uAlpha;
                varying vec2 vUv;

                void main() {
                    float dist = length(vUv - 0.5);
                    float margin = fwidth(vUv.x);
                    float d = smoothstep(0.4 + margin, 0.4, dist);

                    gl_FragColor.rgb = vec3(1.0);
                    gl_FragColor.a = 0.15 * d * uAlpha;
                }
            `,
      transparent: !0,
      depthWrite: !1,
      depthTest: !1
    });
    this._jumpCircle = new scope.Mesh(scope.utils.plane, e), this._jumpCircle.isCharacterControls = !0, this._jumpCircle.name = "Jump Circle", this._jumpCircle.frustumCulled = !1, this._jumpCircle.renderOrder = 99999, this._jumpCircle.castShadow = !1, this._jumpCircle.receiveShadow = !1, this._jumpCircle.visible = !1, this.add(this._jumpCircle);
  }
  _update() {
    this._controls._characters._controlMode === "automatic" ? (this._touchActive = scope.math.lerpFPS(this._touchActive, this._controls._touchMovingFinger === -1 ? 0 : 1, .25), this._touchScale = scope.math.lerpFPS(this._touchScale, scope.math.fit(this._touchActive, 0, 1, .75, 1), .25), this._moveCircle.position.copy(this._controls._automaticMovingCirclePosition11())) : (this._touchActive = scope.math.lerpFPS(this._touchActive, this._controls._canTouch ? 1 : 0, .25), this._touchScale = scope.math.lerpFPS(this._touchScale, scope.math.fit(this._touchActive, 0, 1, 0, this._controls._controlTouchManualMultiplier), .25), this._moveCircle.position.copy(this._controls._manualMovingCirclePosition11())), this._touchActive < .001 ? this._touchActive = 0 : this._touchActive > .999 && (this._touchActive = 1), this._touchPosition.lerp(this._controls._touchMovingDelta, scope.math.lerpCoefFPS(.2)), this._moveCircle.material.uniforms.uInnerPos.value.copy(this._touchPosition).multiplyScalar(.35), this._moveCircle.material.uniforms.uInnerPos.value.y *= -1, this._moveCircle.visible = this._touchActive !== 0, this._moveCircle.material.uniforms.uScale.value = this._touchScale, this._moveCircle.material.uniforms.uAlpha.value = scope.ease("power3.out", this._touchActive), this._jumpCircle.visible = this._jumpAnimVar.value > 0, this._jumpCircle.material.uniforms.uScale.value = 1 - this._jumpAnimVar.value, this._jumpCircle.material.uniforms.uAlpha.value = scope.ease("power3.out", this._jumpAnimVar.value);
  }
  _animateJump(e) {
    this._jumpCircle.position.x = e.position11.x, this._jumpCircle.position.y = e.position11.y, scope.createTween(this._jumpAnimVar, {
      from: {
        value: 1
      },
      to: {
        value: 0
      },
      ease: "power2.out",
      duration: .5,
      overwrite: !0
    });
  }
};
}
