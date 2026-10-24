/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1559713:1565425.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2006(scope) {
scope.bubble = class bubble extends scope.Group {
  constructor({
    npc: e = null,
    text: i = "placeholder text",
    index: s = 0,
    options: a = {}
  } = {}) {
    super(), this.name = `Bubble ${s}`, this._npc = e, this._text = i, this._textLengthWithoutTags = scope.meshText.getTextWithoutTags(i).length, this._index = s, this._options = a, this._hiding = !1, this.visible = !1, this.frustumCulled = !1, this._createBubble();
  }
  _createBubble() {
    var o;
    const e = typeof this._options.bubbleMaterialGenerator == "function" ? this._options.bubbleMaterialGenerator : null,
      i = this._options.bubbleMaterialGeneratorArgs || void 0;
    this._bubble = new scope.Mesh(scope.bubbleGeo, (e == null ? void 0 : e(i)) || new scope.ShaderMaterial({
      uniforms: {
        uSize: {
          value: new scope.Vector2(1, 1)
        },
        uColor: {
          value: new scope.Color("#ffffff")
        }
      },
      vertexShader: `
                attribute float pointer;

                ${scope.matrixutils_default}

                uniform vec2 uSize;

                varying vec2 vUv;
                flat varying float vPointer;
                varying vec2 vHighPrecisionZW;

                void main() {
                    vUv = uv;
                    vPointer = pointer;

                    vec3 pos = position;
                    if (pointer < 0.5) pos.xy *= uSize;
                    pos.y += 0.07; // compensate for pointer
                    pos.z -= 0.1; // move behind of texts

                    gl_Position = projectionMatrix * viewMatrix * billboardModelMatrix() * vec4(pos, 1.0);
                    vHighPrecisionZW = gl_Position.zw;
                }
            `,
      fragmentShader: `
                layout(location = 1) out highp vec4 gInfo;

                uniform vec2 uSize;
                uniform vec3 uColor;

                varying vec2 vUv;
                flat varying float vPointer;
                varying vec2 vHighPrecisionZW;

                float sdRoundedBox(vec2 p, vec2 b, float r) {
                    vec2 q = abs(p) - b + r;
                    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
                }

                void main() {
                    if (vPointer < 0.5) {
                        vec2 aspectMult = mix(vec2(uSize.x / uSize.y, 1.0), vec2(1.0, uSize.y / uSize.x), step(uSize.x, uSize.y));
                        float shape = sdRoundedBox((vUv - 0.5) * aspectMult, vec2(0.5) * aspectMult, 0.1 / min(uSize.x, uSize.y));
                        if (shape > 0.001) discard;
                    }

                    gl_FragColor = vec4(uColor, 0.0);
                    gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), vec3(0.0));
                }
            `
    })), this._bubble.name = "bubble background", this._bubble.frustumCulled = !1, this._bubble.scale.setScalar(0), this.add(this._bubble);
    const s = typeof this._options.textMaterialGenerator == "function" ? this._options.textMaterialGenerator : null,
      a = this._options.textMaterialGeneratorArgs || void 0;
    this._textMesh = new scope.meshText({
      font: "REM-Medium.font",
      text: this._text,
      size: .15,
      align: "left",
      width: 2,
      letterSpacing: 0,
      lineHeight: .85,
      ...(((o = this._options) == null ? void 0 : o.textOptions) || {})
    }, (s == null ? void 0 : s(a)) || void 0), this._textMesh.name = "bubble text", this._textMesh.frustumCulled = !1, this.add(this._textMesh), this._textMesh.ready.then(() => this._updateBubbleSizes());
  }
  _updateBubbleSizes() {
    var h, d, p, f, _, x;
    const e = this._options.marginX || .175,
      i = this._options.marginY || .1,
      s = this._textMesh.size.x,
      a = this._textMesh.size.y + this._textMesh.lineSize,
      o = (d = (h = this._bubble.material) == null ? void 0 : h.uniforms) == null ? void 0 : d.uSize;
    o && (o.value.set(s, a), o.value.x += e * 2, o.value.y += i * 2);
    const l = (f = (p = this._textMesh.material) == null ? void 0 : p.uniforms) == null ? void 0 : f.uSize,
      c = (x = (_ = this._textMesh.material) == null ? void 0 : _.uniforms) == null ? void 0 : x.uMargins;
    l && l.value.set(s, a), c && c.value.set(e, i);
  }
  show(e) {
    var s;
    if (this.visible) return;
    const i = (s = this._textMesh.material) == null ? void 0 : s.uniforms;
    this._updateBubbleSizes(), this._hiding = !1, this.visible = !0, scope.events$1.emit("npc_bubble_show", {
      object: this._npc,
      npc: this._npc._id,
      text: this._text,
      index: this._index
    }), scope.createTween(this._bubble.scale, {
      to: {
        x: 1,
        y: 1,
        z: 1
      },
      duration: .65,
      ease: "elastic.out(1, 1)"
    }), i != null && i.uAlpha && scope.createTween(i.uAlpha, {
      to: {
        value: 1
      }
    }), i != null && i.uAnimationProgress && (scope.createTween(i.uAnimationProgress, {
      to: {
        value: 0
      }
    }), scope.createTween(i.uAnimationProgress, {
      from: {
        value: 0
      },
      to: {
        value: 1
      },
      delay: .35,
      duration: Math.max(1, e * this._textLengthWithoutTags) * .3,
      overwrite: !1,
      ease: "none",
      onStart: () => {
        scope.events$1.emit("npc_bubble_text_starts", {
          object: this._npc,
          npc: this._npc._id,
          text: this._text,
          index: this._index
        });
      },
      onComplete: () => {
        scope.events$1.emit("npc_bubble_text_ends", {
          object: this._npc,
          npc: this._npc._id,
          text: this._text,
          index: this._index
        });
      }
    }));
  }
  hide(e = !1) {
    var a;
    const i = (a = this._textMesh.material) == null ? void 0 : a.uniforms;
    if (e) {
      this._hiding = !1, this.visible = !1, i != null && i.uAlpha && scope.createTween(i.uAlpha, {
        to: {
          value: 0
        }
      }), scope.createTween(this._bubble.scale, {
        to: {
          x: 0,
          y: 0,
          z: 0
        }
      });
      return;
    }
    if (this._hiding || !this.visible) return;
    this._hiding = !0, this.visible = !0;
    const s = {
      object: this._npc,
      npc: this._npc._id,
      text: this._text,
      index: this._index
    };
    scope.events$1.emit("npc_bubble_hide", s), i != null && i.uAlpha && scope.createTween(i.uAlpha, {
      to: {
        value: 0
      },
      duration: .075,
      ease: "none"
    }), scope.createTween(this._bubble.scale, {
      to: {
        x: 0,
        y: 0,
        z: 0
      },
      delay: .075,
      duration: .2,
      ease: "sine.in",
      onComplete: () => {
        this._hiding = !1, this.visible = !1, scope.events$1.emit("npc_bubble_hidden", s);
      }
    });
  }
  dispose() {
    var e, i, s, a, o, l, c, h;
    this._bubble.geometry.dispose(), this._bubble.material.dispose(), this._textMesh.geometry.dispose(), (a = (s = (i = (e = this._textMesh.material.uniforms) == null ? void 0 : e.tCurve) == null ? void 0 : i.value) == null ? void 0 : s.dispose) == null || a.call(s), (h = (c = (l = (o = this._textMesh.material.uniforms) == null ? void 0 : o.tBand) == null ? void 0 : l.value) == null ? void 0 : c.dispose) == null || h.call(c), this._textMesh.material.dispose();
  }
};
}
