/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1293476:1299405.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1732(scope) {
scope.title$1 = class title$1 {
  constructor(e) {
    this.scene = e, this.ready = scope.miscutils.deferred(), this.baseOffset = 2, this.objs = [], this.hovering = !1, this.hoveredObj = null, this.lastPosition = {
      x: 0,
      y: 0
    }, this.deltaAccum = {
      x: 0,
      y: 0
    }, this.updateCamPosition = !0, this.camPosition = new scope.Vector3(), this.init();
  }
  async init() {
    const e = await scope.geometryLoader.batched("planets/present/intro/title_vertical.drc");
    this.group = new scope.Group(), this.group.name = "Title Group", this.groupHit = new scope.Group();
    let i = e.length,
      s = e.reduce((l, c) => l + c.attributes.position.count, 0),
      a = e.reduce((l, c) => l + c.index.count, 0);
    this.mesh = new scope.BatchedMesh(i, s, a, scope.material$1({})), this.mesh.name = "Title", this.mesh.frustumCulled = !1, this.mesh.sortObjects = !1, this.mesh.receiveShadow = !1, this.mesh.castShadow = !1, this.mesh.perObjectFrustumCulled = !1, e.forEach((l, c) => {
      this.mesh.addInstance(this.mesh.addGeometry(l));
      const h = new scope.Group();
      h.__finalPosition = {
        x: 0,
        y: 0,
        z: 0
      }, h.__position = {
        x: 0,
        y: 0,
        z: 0
      }, h.__finalRotation = {
        x: 0,
        y: 0
      }, h.__rotation = {
        x: 0,
        y: 0
      }, h.__scale = {
        value: 1
      }, h.__animRotation = {
        x: 0,
        y: 0
      }, h.__animScale = {
        value: 1
      };
      const d = 5.35;
      h.__position.x = (c % 3 - 1) * d, h.__position.y = (Math.floor(c / 3) - 1) * -6.9, h.__position.z = 0, h.__finalPosition.x = h.__position.x, h.__finalPosition.y = h.__position.y, h.__finalPosition.z = h.__position.z, h.position.copy(h.__finalPosition), h.updateMatrix(), this.objs.push(h);
    }), this.group.add(this.mesh), this.scene.add(this.group);
    const o = e.map(() => new scope.BoxGeometry(4.05, 5.35, 4.25));
    i = o.length, s = o.reduce((l, c) => l + c.attributes.position.count, 0), a = o.reduce((l, c) => l + c.index.count, 0), this.hitMesh = new scope.BatchedMesh(i, s, a, scope.material$1({})), this.hitMesh.name = "Title Hitmesh", this.hitMesh.frustumCulled = !1, this.hitMesh.sortObjects = !1, this.hitMesh.receiveShadow = !1, this.hitMesh.castShadow = !1, this.hitMesh.perObjectFrustumCulled = !1, this.groupHit.add(this.hitMesh), o.forEach((l, c) => {
      this.hitMesh.addInstance(this.hitMesh.addGeometry(l)), this.hitMesh.setMatrixAt(c, this.objs[c].matrix);
    }), this.scene.beforeRenderCbs.push(this.update.bind(this)), this.interaction = new scope.meshInteraction({
      meshes: [this.hitMesh],
      camera: this.scene.camera,
      interactWhileTouching: !0,
      onMove: this.move,
      onHover: this.hover,
      onTouch: this.touch,
      ctx: this
    }), this.ready.resolve();
  }
  update() {
    if (this.scene.___disposed) return;
    const e = this.scene.camera;
    this.updateCamPosition && this.camPosition.copy(e.position), scope._v0$f.copy(e.target).sub(this.camPosition).normalize(), scope._v1$9.copy(this.camPosition).addScaledVector(scope._v0$f, 45), this.group.position.copy(scope._v1$9), scope._v0$f.subVectors(this.camPosition, e.target), scope._v0$f.lengthSq() === 0 && (scope._v0$f.z = 1), scope._v0$f.normalize(), scope._v1$9.crossVectors(e.up, scope._v0$f), scope._v1$9.lengthSq() === 0 && (Math.abs(e.up.z) === 1 ? scope._v0$f.x += 1e-4 : scope._v0$f.z += 1e-4, scope._v0$f.normalize(), scope._v1$9.crossVectors(e.up, scope._v0$f)), scope._v1$9.normalize(), scope._v2$2.crossVectors(scope._v0$f, scope._v1$9), this.group.position.addScaledVector(scope._v2$2, this.baseOffset), this.group.quaternion.setFromRotationMatrix(scope._m0$3.lookAt(this.camPosition, e.target, scope._v0$f.set(0, 1, 0))), this.group.updateMatrixWorld(), this.groupHit.position.copy(this.group.position), this.groupHit.quaternion.copy(this.group.quaternion), this.groupHit.scale.copy(this.group.scale), this.groupHit.updateMatrix(), this.groupHit.updateMatrixWorld(), this.objs.forEach((i, s) => {
      i.position.copy(i.__finalPosition), i.rotation.set(i.__finalRotation.x + i.__animRotation.x, i.__finalRotation.y + i.__animRotation.y, 0), i.scale.setScalar(i.__scale.value * i.__animScale.value), i.updateMatrix(), this.mesh.setMatrixAt(s, i.matrix);
    }), this.updateDelta();
  }
  updateDelta() {
    const e = scope.touches$1.get(0),
      i = e.position.x - this.lastPosition.x,
      s = -(e.position.y - this.lastPosition.y);
    this.deltaAccum.x += i, this.deltaAccum.y += s, this.lastPosition.x = e.position.x, this.lastPosition.y = e.position.y;
    const a = scope.math.frictionFPS(.4);
    this.deltaAccum.x *= a, this.deltaAccum.y *= a;
  }
  touch(e) {
    e.action === "touch_start" ? (this.lastPosition.x = e.event.position.x, this.lastPosition.y = e.event.position.y, this.deltaAccum.x = 0, this.deltaAccum.y = 0, this.move(e)) : (this.updateDelta(), this.hovering && this.hover({
      action: "hover_out"
    }));
  }
  move(e) {
    this.hovering = !0, this.hoveredObj = e.interactions[0].batchId;
  }
  hover(e) {
    if (e.action === "hover_in") {
      this.hovering = !0, this.hoveredObj = e.interactions[0].batchId;
      const i = this.objs[this.hoveredObj];
      scope.createTween(i.__scale, {
        to: {
          value: 1.05
        },
        duration: .2,
        ease: "power2.out",
        onComplete: () => {
          scope.createTween(i.__scale, {
            to: {
              value: 1
            },
            duration: .75,
            ease: "elastic.out(1, 0.6)"
          });
        }
      });
    } else {
      this.hovering = !1;
      const i = Math.abs(this.deltaAccum.x) > Math.abs(this.deltaAccum.y) ? "x" : "y",
        s = Math.sign(this.deltaAccum[i] * (i === "y" ? -1 : 1));
      if (s === 0 || this.hoveredObj === null) return;
      const a = this.objs[this.hoveredObj];
      let o = 1;
      i === "x" && (o = scope.math.makeAnglePositive(a.__rotation.x) > .1 ? -1 : 1);
      const l = i === "x" ? "y" : "x";
      a.__rotation[l] += Math.PI * s * o;
      const c = a.__rotation[l] - a.rotation[l];
      a.__finalRotation[l] = scope.math.makeAnglePositive(a.rotation[l]), a.__rotation[l] = a.__finalRotation[l] + c, a.__rotation[l] = Math.round(a.__rotation[l] / Math.PI) * Math.PI, scope.createTween(a.__finalRotation, {
        to: l === "x" ? {
          x: a.__rotation[l]
        } : {
          y: a.__rotation[l]
        },
        duration: 2.5,
        ease: `elastic.out(1,${(.5 + Math.random() * .3).toFixed(2)})`
      }), scope.createTween(a.__scale, {
        to: {
          value: .9
        },
        duration: .4,
        ease: "power2.out",
        onComplete: () => {
          scope.createTween(a.__scale, {
            to: {
              value: 1
            },
            duration: 1,
            ease: "elastic.out(1, 0.6)"
          });
        }
      }), scope.events$1.emit("webgl_play_audio", `rune${Math.floor(Math.random() * 3 + 1)}`);
    }
  }
  playInAnimation(e = 0) {
    for (let i = 0; i < this.objs.length; i++) {
      const s = this.objs[i];
      s.__animScale.value = 0;
      const a = e + .075 * i;
      scope.createTween(s.__animScale, {
        from: {
          value: 0
        },
        to: {
          value: 1
        },
        duration: 3,
        delay: a,
        ease: "elastic.out(1, 0.75)"
      }), scope.createTween(s.__animRotation, {
        from: {
          x: (Math.random() - .5) * Math.PI * 2,
          y: (Math.random() - .5) * Math.PI * 2
        },
        to: {
          x: 0,
          y: 0
        },
        duration: 3,
        delay: a,
        ease: "elastic.out(1, 0.75)"
      });
      const o = this.objs[4].__position;
      scope.createTween(s.__finalPosition, {
        from: {
          x: o.x,
          y: o.y,
          z: o.z
        },
        to: {
          x: s.__position.x,
          y: s.__position.y,
          z: s.__position.z
        },
        duration: 3,
        delay: a,
        ease: "elastic.out(1, 0.75)"
      });
    }
  }
  playOutAnimation(e = 0) {
    this.updateCamPosition = !1;
  }
  resize() {
    const e = this.scene.mobileLayout ? 1.2 : 1;
    this.mesh.scale.setScalar(e), this.hitMesh.scale.setScalar(e);
  }
};
}
