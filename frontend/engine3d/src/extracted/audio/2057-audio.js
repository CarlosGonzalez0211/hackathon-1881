/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1633791:1635984.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2057(scope) {
scope.audio = class audio {
  constructor({
    scene: e,
    characters: i
  } = {}) {
    this.scene = e, this.characters = i, this.ambianceSpheres = {
      forest: {
        sphere: new scope.Sphere(new scope.Vector3(-13.4694, -14.7504, 1.36152), 15.4),
        margin: 4
      },
      city: {
        sphere: new scope.Sphere(new scope.Vector3(27.6687, 13.6836, 8.14707), 27.5),
        margin: 10
      },
      beach: {
        sphere: new scope.Sphere(new scope.Vector3(-11.8381, 12.2255, -1.87004), 12),
        margin: 3.5
      },
      factory: {
        sphere: new scope.Sphere(new scope.Vector3(-2.06543, 2.01072, -32.7937), 22.5),
        margin: 5
      },
      waterfalls: {
        sphere: new scope.Sphere(new scope.Vector3(11.2153, -18.8393, -9.09714), 12),
        margin: 2
      },
      temple: {
        sphere: new scope.Sphere(new scope.Vector3(-7.21651, 34.6679, -5.4496), 10),
        margin: 3
      }
    }, this.volumes = {
      walk: 0,
      walkWater: 0,
      ambiances: {
        forest: 0,
        city: 0,
        beach: 0,
        factory: 0,
        waterfalls: 0,
        temple: 0
      }
    }, this.scene.beforeRenderCbs.push(this.update.bind(this)), scope.events$1.on("character_physics_jump", this._playJump, this), scope.events$1.on("character_physics_land", this._playLand, this);
  }
  update() {
    const e = this.characters._localObject,
      i = e.userData.medium === this.characters.MEDIUMS.GROUND ? 1 : 0,
      a = scope.math.clamp(e.animationProps.weights[1] + e.animationProps.weights[2], 0, 1) * i > .5 ? 1 : 0;
    this.volumes.walk = scope.math.lerpFPS(this.volumes.walk, a, .25);
    const l = e.position.length() < 22 ? 1 : 0;
    this.volumes.walkWater = scope.math.lerpFPS(this.volumes.walkWater, a * l, .25);
    const c = Math.max(0, this.volumes.walk - this.volumes.walkWater),
      h = this.volumes.walkWater;
    scope.events$1.emit("webgl_set_audio_volume", "footsteps", c * .2), scope.events$1.emit("webgl_set_audio_volume", "footsteps-water", h * .2);
    const d = Object.keys(this.ambianceSpheres);
    let p = "",
      f = 0;
    for (let x = 0; x < d.length; x++) {
      const b = d[x],
        T = this.ambianceSpheres[b].sphere,
        M = e.position.distanceTo(T.center),
        w = scope.math.fit(M, T.radius, Math.max(0, T.radius - this.ambianceSpheres[b].margin), 0, 1);
      if (w > 0) {
        p = b, f = w;
        break;
      }
    }
    const _ = Object.keys(this.volumes.ambiances);
    _.forEach(x => {
      this.volumes.ambiances[x] = 0;
    }), p && (this.volumes.ambiances[p] = f), scope.events$1.emit("webgl_set_audio_volume", "ambiance-base", .5), _.forEach(x => {
      scope.events$1.emit("webgl_set_audio_volume", `ambiance-${x}`, this.volumes.ambiances[x] * .5);
    });
  }
  _playJump() {
    scope.events$1.emit("webgl_play_audio", "jump");
  }
  _playLand() {
    scope.events$1.emit("webgl_play_audio", "land");
  }
  dispose() {
    scope.events$1.off("character_physics_jump", this._playJump, this), scope.events$1.off("character_physics_land", this._playLand, this);
  }
};
}
