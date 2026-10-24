/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1370876:1383522.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1915(scope) {
scope.la = class la {
  constructor(e, i) {
    scope.oe(this, scope.ir, new scope.Vector3());
    scope.oe(this, scope.ms, new scope.Spherical());
    scope.oe(this, scope.gs, new scope.Quaternion());
    scope.oe(this, scope.Gn, new scope.Matrix4());
    scope.oe(this, scope.Rt, new scope.Vector3());
    scope.oe(this, scope.Qt, new scope.Vector3());
    scope.oe(this, scope.ui, new scope.Vector3());
    scope.oe(this, scope.Ji, new scope.Object3D());
    scope.oe(this, scope.jt, new scope.Line3());
    scope.oe(this, scope.nr, new scope.Line3());
    scope.oe(this, scope.Zi, new scope.Box3());
    scope.oe(this, scope.sr, new scope.Plane());
    this._characters = e, this._camera = this._characters._camera, this.ready = new Promise(s => {
      this.isReady = s;
    }), this._colliderMesh = null, this._geometry = null, this._collider = null, this._deltaRatioAccumulator = 0, this._deltaRatioAccumulatorSteps = 0, this._positionPrevPhysics = new scope.Vector3(), this._positionNextPhysics = new scope.Vector3(), this._accelerationPhysics = new scope.Vector3(), this._velocityPhysics = new scope.Vector3(), this._velocityVariation = 0, this._rotationPrevPhysics = 0, this._rotationNextPhysics = 0, this._substeps = typeof i.substeps == "number" ? i.substeps : 3, this._positionForce = typeof i.positionForce == "number" ? i.positionForce : .0045, this._jumpForce = typeof i.jumpForce == "number" ? i.jumpForce : .2, this._gravity = typeof i.gravity == "number" ? i.gravity : -.00981, this._directionLerp = typeof i.directionLerp == "number" ? i.directionLerp : .075, this._velPhysicsDamp = typeof i.damp == "number" ? i.damp : .92, this._velPhysicsIdleDamp = typeof i.dampIdle == "number" ? i.dampIdle : .92, this._velPhysicsDampInterpolation = 0, this._rotVelocityMin = typeof i.rotVelocityMin == "number" ? i.rotVelocityMin : .0035, this._rotVelocityMax = typeof i.rotVelocityMax == "number" ? i.rotVelocityMax : .02, this._needsToLand = !1, this._lastFloorPosition = new scope.Vector3(), this._isMoving = !1, this._jumpRequested = !1, this._moveTowardsCameraTarget = i.moveTowardsCameraTarget !== !1, this._autoStep = i.autoStep !== !1, this._isAutoStepping = !1, this._checkFalling = i.checkFalling !== !1, this._rayCaster = new scope.Raycaster(), this._rayCaster.firstHitOnly = !0, this._nearestVerticalPoint = -1, this._capsuleRadiusPercentage = typeof i.capsuleRadiusPercentage == "number" ? Math.min(i.capsuleRadiusPercentage, .45) : .2, this._charactersCapsule = {
      radius: .5,
      segment: new scope.Line3(new scope.Vector3(0, 0, 0), new scope.Vector3(0, 1, 0))
    }, this._floorDetectInclination = typeof i.floorDetectInclination == "number" ? Math.min(1, i.floorDetectInclination) : .8, this._fallLimitDistance = typeof i.fallLimitDistance == "number" ? Math.min(1, i.fallLimitDistance) : 10, this._isOnFloor = !0, this._prevIsOnFloor = this._isOnFloor, this._prevIsOnFloorTime = -1, this._shapecastFuncs = {
      intersectsBounds: s => s.intersectsBox(scope.L(this, scope.Zi)),
      intersectsTriangle: s => {
        const a = scope.L(this, scope.Rt),
          o = scope.L(this, scope.Qt),
          l = s.closestPointToSegment(scope.L(this, scope.jt), a, o);
        if (l < this._charactersCapsule.radius) {
          const c = o.equals(scope.L(this, scope.jt).start),
            h = this._charactersCapsule.radius - l,
            d = o.sub(a).normalize();
          scope.L(this, scope.jt).start.addScaledVector(d, h), scope.L(this, scope.jt).end.addScaledVector(d, h), c && d.dot(this._characters._localObject.up) > 0 && (s.getNormal(scope.L(this, scope.ui)), scope.L(this, scope.ui).dot(this._characters._localObject.up) > this._floorDetectInclination && (this._isOnFloor = !0));
        }
        return !1;
      }
    }, this._initializeBVH(i);
  }
  static ensureRightVector(e, i, s) {
    s.lengthSq() === 0 && (Math.abs(e.z) === 1 ? i.x += 1e-4 : i.z += 1e-4, i.normalize(), s.crossVectors(e, i));
  }
  _updateCapsule(e) {
    const i = Math.abs(e.max.y - e.min.y),
      s = i * this._capsuleRadiusPercentage,
      a = i - s * 2;
    this._charactersCapsule.radius = s, this._charactersCapsule.segment.end.y = a;
  }
  async _initializeBVH(e) {
    const i = new scope.WorkerWrapper$1();
    if (i.onmessage = a => {
      const {
        serialized: o,
        position: l
      } = a.data;
      this._geometry = new scope.BufferGeometry(), this._geometry.setAttribute("position", new scope.BufferAttribute(l, 3)), this._geometry.setIndex(new scope.BufferAttribute(o.index, 1)), this._geometry.computeBoundingBox(), this._geometry.computeBoundingSphere(), this._geometry.boundsTree = scope.MeshBVH.deserialize(o, this._geometry, {
        setIndex: !1
      }), this._collider = new scope.collider(this._geometry), i.terminate(), this.isReady();
    }, !e.colliderGeometry) throw new Error("Collider geometry not provided");
    const s = typeof e.colliderGeometry == "string" ? await scope.geometryLoader.load(e.colliderGeometry) : e.colliderGeometry;
    this._colliderMesh = new scope.Mesh(s), this._colliderMesh.geometry.computeBoundingBox(), this._colliderMesh.geometry.computeBoundingSphere(), this._colliderMesh.updateMatrixWorld(!0), i.postMessage({
      position: this._colliderMesh.geometry.attributes.position.array,
      index: this._colliderMesh.geometry.index ? this._colliderMesh.geometry.index.array : null,
      matrixWorld: this._colliderMesh.matrixWorld.elements
    });
  }
  _update(e = 0, i = 1) {
    const s = this._characters._localObject;
    for (this._isMoving = e.length() > 1e-5, this._deltaRatioAccumulator += i, this._deltaRatioAccumulatorSteps = 0; this._deltaRatioAccumulator >= 1;) {
      if (this._deltaRatioAccumulator = Math.max(0, this._deltaRatioAccumulator - 1), this._deltaRatioAccumulatorSteps++, this._positionPrevPhysics.copy(this._positionNextPhysics), this._rotationPrevPhysics = this._rotationNextPhysics, this._isAutoStepping = !1, this._isMoving) {
        const h = this._moveTowardsCameraTarget ? this._camera.baseTarget : this._positionPrevPhysics;
        if (scope.L(this, scope.Rt).copy(this._camera.basePosition).sub(h).normalize(), scope.L(this, scope.Qt).crossVectors(s.up, scope.L(this, scope.Rt)), la.ensureRightVector(s.up, scope.L(this, scope.Rt), scope.L(this, scope.Qt)), scope.L(this, scope.ui).crossVectors(scope.L(this, scope.Qt), s.up), scope.L(this, scope.Gn).lookAt(scope.L(this, scope.ir), scope.L(this, scope.ui), s.up), scope.L(this, scope.gs).setFromRotationMatrix(scope.L(this, scope.Gn)), this._accelerationPhysics.copy(e).multiplyScalar(this._positionForce).applyQuaternion(scope.L(this, scope.gs)), this._autoStep && this._isOnFloor) {
          scope.L(this, scope.Rt).copy(this._accelerationPhysics).normalize();
          const p = 3,
            f = this._charactersCapsule.radius * 2;
          for (let _ = 0; _ < p; _++) {
            const x = (_ + 1) / p * f;
            scope.L(this, scope.Qt).copy(this._positionPrevPhysics).addScaledVector(scope.L(this, scope.Rt), x), scope.L(this, scope.ui).copy(scope.L(this, scope.Qt)).addScaledVector(s.up, this._charactersCapsule.radius * 2), this._rayCaster.set(scope.L(this, scope.ui), scope.L(this, scope.Qt).copy(s.up).negate());
            const b = this._rayCaster.intersectObject(this._collider)[0];
            if (b) {
              const T = scope.L(this, scope.sr).setFromNormalAndCoplanarPoint(s.up, this._positionPrevPhysics).distanceToPoint(b.point),
                M = this._charactersCapsule.radius * .1,
                w = this._charactersCapsule.radius * 1.5;
              if (T > M && T < w && b.face.normal.dot(s.up) > this._floorDetectInclination) {
                this._isAutoStepping = !0, scope.L(this, scope.Qt).copy(b.point).addScaledVector(s.up, T * .5);
                const D = this._accelerationPhysics.length(),
                  R = this._positionForce * .05;
                this._accelerationPhysics.copy(scope.L(this, scope.Rt).subVectors(scope.L(this, scope.Qt), this._positionPrevPhysics).normalize()).multiplyScalar(D + R);
                break;
              }
            }
          }
        }
        const d = this._camera.isFollowCamera ? this._camera._spherical.theta : 0;
        this._rotationNextPhysics = scope.math.lerp(this._rotationNextPhysics, scope.math.getShortestRotationAngle(this._rotationNextPhysics, scope.L(this, scope.ms).setFromVector3(e).theta + d), this._directionLerp);
      }
      this._isOnFloor || this._accelerationPhysics.add(scope.L(this, scope.Rt).copy(s.up).multiplyScalar(this._gravity)), this._velocityPhysics.add(this._accelerationPhysics), this._accelerationPhysics.setScalar(0);
      const a = !this._isMoving && s.userData.medium === this._characters.MEDIUMS.GROUND && !this._needsToLand;
      this._velPhysicsDampInterpolation = a ? scope.math.lerp(this._velPhysicsDampInterpolation, 0, .05) : 1, this._velocityPhysics.multiplyScalar(scope.math.lerp(this._velPhysicsIdleDamp, this._velPhysicsDamp, this._velPhysicsDampInterpolation)), this._velocityPhysics.clampLength(0, this._charactersCapsule.radius * .9 * this._substeps), this._isAutoStepping || (this._isOnFloor = !1), scope.L(this, scope.Ji).position.copy(this._positionPrevPhysics), scope.L(this, scope.Ji).quaternion.copy(s.quaternion), scope.L(this, scope.Ji).scale.copy(s.scale);
      for (let h = 0; h < this._substeps; h++) this._substep();
      this._positionNextPhysics.copy(scope.L(this, scope.Ji).position), s.velocity.add(scope.L(this, scope.ui).subVectors(this._positionNextPhysics, this._positionPrevPhysics)), s.velocity.multiplyScalar(this._characters._velocityCharDamp), this._velocityVariation += scope.L(this, scope.ui).length(), this._velocityVariation *= this._characters._velocityCharDamp;
      const o = s.velocity.length(),
        l = o < .001 ? 1 : 1 - Math.abs(scope.L(this, scope.Rt).copy(s.velocity).normalize().dot(s.up));
      s.velocityHorizontal = o * l, s.velocityHorizontal > this._rotVelocityMin && (scope.L(this, scope.Rt).copy(s.velocity).applyAxisAngle(s.up, this._rotationPrevPhysics), scope.L(this, scope.ms).setFromVector3(scope.L(this, scope.Rt).applyQuaternion(scope.L(this, scope.gs).copy(s.quaternion).invert())), this._rotationNextPhysics = scope.math.lerp(this._rotationNextPhysics, scope.math.getShortestRotationAngle(this._rotationNextPhysics, scope.L(this, scope.ms).theta), this._directionLerp * scope.math.fit(s.velocityHorizontal, this._rotVelocityMin, this._rotVelocityMax, 0, 1)));
      const c = this._detectJump(s);
      this._updateNearestVerticalPoint(c), this._checkFalling && this._positionNextPhysics.y + this._fallLimitDistance < this._geometry.boundingBox.min.y && this._snap(this._characters._initialPosition.toArray(), this._characters._initialRotation, this._characters._initialUp.toArray());
    }
    this._updatePosition(this._deltaRatioAccumulator), this._updateRotation(this._deltaRatioAccumulator);
  }
  _updatePosition(e = 1) {
    this._characters._localObject.position.lerpVectors(this._positionPrevPhysics, this._positionNextPhysics, e);
  }
  _updateRotation(e = 1) {
    const i = this._characters._localObject,
      s = scope.math.lerp(this._rotationPrevPhysics, this._rotationNextPhysics, e),
      a = s - i.rotationHorizontal;
    i.rotationHorizontal = s, scope.L(this, scope.Rt).set(0, 0, -1).applyQuaternion(i.quaternion), scope.L(this, scope.Rt).applyAxisAngle(i.up, a), scope.L(this, scope.Qt).crossVectors(i.up, scope.L(this, scope.Rt)), la.ensureRightVector(i.up, scope.L(this, scope.Rt), scope.L(this, scope.Qt)), scope.L(this, scope.ui).crossVectors(scope.L(this, scope.Qt), i.up), scope.L(this, scope.Gn).lookAt(scope.L(this, scope.ir), scope.L(this, scope.ui), i.up), i.quaternion.setFromRotationMatrix(scope.L(this, scope.Gn));
  }
  _setFloorState(e = !1) {
    this._isOnFloor = e, this._prevIsOnFloor = e, this._characters._localObject.userData.medium = e ? this._characters.MEDIUMS.GROUND : this._characters.MEDIUMS.AIR, this._needsToLand = !e;
  }
  _resetPhysics(e = !1) {
    this._accelerationPhysics.setScalar(0), this._velocityPhysics.setScalar(0), this._velocityVariation = 0, this._characters._localObject.velocity.setScalar(0), this._characters._localObject.velocityHorizontal = 0, this._setFloorState(e);
  }
  _snap(e = [0, 0, 0], i = 0, s = [0, 1, 0], a = !1) {
    this._positionPrevPhysics.fromArray(e), this._positionNextPhysics.fromArray(e), this._updatePosition(0), this._characters._localObject.up.fromArray(s).normalize(), this._rotationPrevPhysics = i, this._rotationNextPhysics = i, this._updateRotation(0), this._resetPhysics(a);
  }
  _substep() {
    const e = 1 / this._substeps;
    scope.L(this, scope.Rt).copy(this._velocityPhysics).multiplyScalar(e), scope.L(this, scope.Ji).position.add(scope.L(this, scope.Rt));
    const i = this._performShapecast(scope.L(this, scope.Ji), e);
    this._isAutoStepping || this._velocityPhysics.addScaledVector(i, -i.dot(this._velocityPhysics));
  }
  _performShapecast(e, i) {
    e.updateMatrix(), scope.L(this, scope.jt).copy(this._charactersCapsule.segment), scope.L(this, scope.jt).start.y += this._charactersCapsule.radius, scope.L(this, scope.jt).end.y += this._charactersCapsule.radius, scope.L(this, scope.jt).start.applyMatrix4(e.matrix), scope.L(this, scope.jt).end.applyMatrix4(e.matrix), scope.L(this, scope.nr).copy(scope.L(this, scope.jt)), scope.L(this, scope.Zi).makeEmpty(), scope.L(this, scope.Zi).expandByPoint(scope.L(this, scope.jt).start), scope.L(this, scope.Zi).expandByPoint(scope.L(this, scope.jt).end), scope.L(this, scope.Zi).min.addScalar(-this._charactersCapsule.radius), scope.L(this, scope.Zi).max.addScalar(this._charactersCapsule.radius), this._geometry.boundsTree.shapecast(this._shapecastFuncs);
    const s = scope.L(this, scope.Rt);
    s.subVectors(scope.L(this, scope.jt).start, scope.L(this, scope.nr).start);
    const a = Math.max(0, s.length() - 1e-5 * i);
    return s.normalize(), e.position.addScaledVector(s, a), s;
  }
  _detectJump(e) {
    scope.L(this, scope.Rt).copy(this._positionNextPhysics).add(scope.L(this, scope.Qt).copy(e.up).multiplyScalar(.005)), scope.L(this, scope.Qt).copy(e.up).negate(), this._rayCaster.set(scope.L(this, scope.Rt), scope.L(this, scope.Qt));
    const i = this._rayCaster.intersectObject(this._collider)[0],
      a = (i && typeof i.distance == "number" ? i.distance : 1 / 0) > .25,
      o = this._velocityVariation > .01;
    if (!this._isOnFloor && !o && (this._isOnFloor = !0), this._prevIsOnFloor !== this._isOnFloor) {
      if (this._prevIsOnFloor) {
        const l = scope.renderInfo.time;
        this._prevIsOnFloorTime === -1 ? this._prevIsOnFloorTime = l : l - this._prevIsOnFloorTime > .045 && a && (this._prevIsOnFloor = !1, this._prevIsOnFloorTime = -1, e.userData.medium = this._characters.MEDIUMS.AIR);
      } else {
        this._prevIsOnFloor = !0, e.userData.medium = this._characters.MEDIUMS.GROUND;
        const l = scope.L(this, scope.sr).setFromNormalAndCoplanarPoint(e.up, this._positionNextPhysics).distanceToPoint(this._lastFloorPosition);
        (this._needsToLand && l > -.3 || l > .3) && scope.events$1.emit("character_physics_land"), this._needsToLand = !1;
      }
    } else this._prevIsOnFloorTime = -1;
    return this._prevIsOnFloor || (!a && e.userData.medium === this._characters.MEDIUMS.AIR && (e.userData.medium = this._characters.MEDIUMS.GROUND), a && e.userData.medium !== this._characters.MEDIUMS.AIR && (e.userData.medium = this._characters.MEDIUMS.AIR)), this._isOnFloor && (this._jumpRequested && (this._jumpRequested = !1, this._velocityPhysics.add(scope.L(this, scope.Rt).copy(e.up).multiplyScalar(this._jumpForce)), this._needsToLand = !0, scope.events$1.emit("character_physics_jump")), this._lastFloorPosition.copy(this._positionNextPhysics)), i;
  }
  _updateNearestVerticalPoint(e) {
    if (!e) {
      this._nearestVerticalPoint = -1;
      return;
    }
    const i = e.face,
      s = this._geometry.attributes.position,
      a = scope.L(this, scope.Rt).fromBufferAttribute(s, i.a).distanceToSquared(e.point),
      o = scope.L(this, scope.Rt).fromBufferAttribute(s, i.b).distanceToSquared(e.point),
      l = scope.L(this, scope.Rt).fromBufferAttribute(s, i.c).distanceToSquared(e.point);
    let c = i.a;
    o < a && o < l && (c = i.b), l < a && l < o && (c = i.c), this._nearestVerticalPoint = c;
  }
};
}
