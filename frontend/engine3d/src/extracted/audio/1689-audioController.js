/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1179264:1187979.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1689(scope) {
scope.audioController = class audioController {
  constructor(e) {
    this.mainController = e, this.camera = null, this._controller = new scope.audioController$1({
      volume: 1,
      muted: !0
    }), scope.events$1.on("prerender", this.updateCamera, this), this.init();
  }
  get muted() {
    return this._controller.muted;
  }
  updateCamera() {
    if (!this.camera) return;
    scope._v0$h.set(0, 0, -1).applyQuaternion(this.camera.quaternion), scope._v1$b.set(0, 1, 0).applyQuaternion(this.camera.quaternion);
    const e = this._controller.listener.context,
      i = e.listener,
      s = e.currentTime,
      a = scope.renderInfo.delta / 1e3,
      o = s + a;
    i.positionX ? (i.positionX.linearRampToValueAtTime(this.camera.position.x, o), i.positionY.linearRampToValueAtTime(this.camera.position.y, o), i.positionZ.linearRampToValueAtTime(this.camera.position.z, o), i.forwardX.linearRampToValueAtTime(scope._v0$h.x, o), i.forwardY.linearRampToValueAtTime(scope._v0$h.y, o), i.forwardZ.linearRampToValueAtTime(scope._v0$h.z, o), i.upX.linearRampToValueAtTime(scope._v1$b.x, o), i.upY.linearRampToValueAtTime(scope._v1$b.y, o), i.upZ.linearRampToValueAtTime(scope._v1$b.z, o)) : (i.setPosition(this.camera.position.x, this.camera.position.y, this.camera.position.z), i.setOrientation(scope._v0$h.x, scope._v0$h.y, scope._v0$h.z, scope._v1$b.x, scope._v1$b.y, scope._v1$b.z));
  }
  init() {
    this.positionals = {}, scope.events$1.on("webgl_set_audio_volume", this.setAudioVolume, this), scope.events$1.on("webgl_play_audio", this.playAudio, this), scope.events$1.on("webgl_stop_audio", this.stopAudio, this), scope.events$1.on("webgl_play_positional", this.playPositional, this), scope.events$1.on("webgl_stop_positional", this.stopPositional, this);
    const e = scope.client$1.lowMemoryDevice ? "music/bgmusic-mobile.ogg" : "music/bgmusic-highq.ogg";
    if (this._controller.addAudio({
      name: "bgmusic",
      url: e,
      volume: .1,
      autoPlay: !0,
      loop: !0
    }), scope.client$1.lowMemoryDevice) {
      this._controller.addAudio({
        name: "quest-complete",
        url: "ui/quest-complete.ogg",
        volume: .25
      });
      return;
    }
    this._controller.addAudio({
      name: "intro-letters",
      url: "intro/letters.ogg",
      volume: .1
    }), this._controller.addAudio({
      name: "button-turn",
      url: "intro/button-turn.ogg",
      volume: .1,
      minTimeBetweenPlays: .2
    }), this._controller.addAudio({
      name: "button-out",
      url: "intro/button-out.ogg",
      volume: .075
    }), this._controller.addAudio({
      name: "rune1",
      url: "intro/rune1.ogg",
      volume: .1,
      minTimeBetweenPlays: .2
    }), this._controller.addAudio({
      name: "rune2",
      url: "intro/rune2.ogg",
      volume: .1,
      minTimeBetweenPlays: .2
    }), this._controller.addAudio({
      name: "rune3",
      url: "intro/rune3.ogg",
      volume: .1,
      minTimeBetweenPlays: .2
    }), this._controller.addAudio({
      name: "rune4",
      url: "intro/rune4.ogg",
      volume: .1,
      minTimeBetweenPlays: .2
    }), this._controller.addAudio({
      name: "ambiance-base",
      url: "ambiances/base.ogg",
      volume: 0,
      autoPlay: !0,
      loop: !0
    }), this._controller.addAudio({
      name: "ambiance-forest",
      url: "ambiances/forest.ogg",
      volume: 0,
      autoPlay: !0,
      loop: !0
    }), this._controller.addAudio({
      name: "ambiance-city",
      url: "ambiances/city.ogg",
      volume: 0,
      autoPlay: !0,
      loop: !0
    }), this._controller.addAudio({
      name: "ambiance-factory",
      url: "ambiances/factory.ogg",
      volume: 0,
      autoPlay: !0,
      loop: !0
    }), this._controller.addAudio({
      name: "ambiance-beach",
      url: "ambiances/beach.ogg",
      volume: 0,
      autoPlay: !0,
      loop: !0
    }), this._controller.addAudio({
      name: "ambiance-waterfalls",
      url: "ambiances/waterfalls.ogg",
      volume: 0,
      autoPlay: !0,
      loop: !0
    }), this._controller.addAudio({
      name: "ambiance-temple",
      url: "ambiances/temple.ogg",
      volume: 0,
      autoPlay: !0,
      loop: !0
    }), this._controller.addAudio({
      name: "footsteps",
      url: "character/footsteps4.ogg",
      volume: 0,
      autoPlay: !0,
      loop: !0,
      sync: !0
    }), this._controller.addAudio({
      name: "footsteps-water",
      url: "character/footsteps-water.ogg",
      volume: 0,
      autoPlay: !0,
      loop: !0,
      sync: !0
    }), this._controller.addAudio({
      name: "jump",
      url: "character/jump-start.ogg",
      volume: .1
    }), this._controller.addAudio({
      name: "land",
      url: "character/jump-land.ogg",
      volume: .125
    }), this._controller.addAudio({
      name: "emoji-starts1",
      url: "character/emoji-starts1.ogg",
      volume: .15
    }), this._controller.addAudio({
      name: "emoji-starts2",
      url: "character/emoji-starts2.ogg",
      volume: .15
    }), this._controller.addAudio({
      name: "emoji-starts3",
      url: "character/emoji-starts3.ogg",
      volume: .15
    }), this._controller.addAudio({
      name: "emoji-ends1",
      url: "character/emoji-ends1.ogg",
      volume: .1
    }), this._controller.addAudio({
      name: "emoji-ends2",
      url: "character/emoji-ends2.ogg",
      volume: .1
    }), this._controller.addAudio({
      name: "emoji-ends3",
      url: "character/emoji-ends3.ogg",
      volume: .1
    }), this._controller.addAudio({
      name: "clothes",
      url: "character/clothes.ogg",
      volume: .2
    }), this._controller.addAudio({
      name: "zoom-off",
      url: "camera/zoom-off-5.ogg",
      volume: .1
    }), this._controller.addAudio({
      name: "zoom-in",
      url: "camera/zoom-in-5.ogg",
      volume: .1
    }), this._controller.addAudio({
      name: "whoosh",
      url: "camera/whoosh2.ogg",
      volume: .2
    }), this._controller.addAudio({
      name: "title",
      url: "ui/title.ogg",
      volume: .25
    }), this._controller.addAudio({
      name: "buttons",
      url: "ui/buttons2.ogg",
      volume: .05
    }), this._controller.addAudio({
      name: "hover2",
      url: "ui/hover2.ogg",
      volume: .2
    }), this._controller.addAudio({
      name: "click2",
      url: "ui/click2.ogg",
      volume: .15
    }), this._controller.addAudio({
      name: "click3",
      url: "ui/click3.ogg",
      volume: .05
    }), this._controller.addAudio({
      name: "open-box1",
      url: "ui/openbox1.ogg",
      volume: .1
    }), this._controller.addAudio({
      name: "open-box2",
      url: "ui/openbox2.ogg",
      volume: .15
    }), this._controller.addAudio({
      name: "open-box-emote",
      url: "ui/openbox-emote.ogg",
      volume: .15
    }), this._controller.addAudio({
      name: "open-box-checklist",
      url: "ui/openbox-checklist.ogg",
      volume: .6
    }), this._controller.addAudio({
      name: "paper1",
      url: "ui/paper1.ogg",
      volume: 0,
      autoPlay: !0,
      loop: !0,
      sync: !1
    }), this._controller.addAudio({
      name: "paper4",
      url: "ui/paper4.ogg",
      volume: 0,
      autoPlay: !0,
      loop: !0,
      sync: !1,
      offset: 3
    }), this._controller.addAudio({
      name: "customize",
      url: "ui/customize.ogg",
      volume: .06
    }), this._controller.addAudio({
      name: "quest-complete",
      url: "ui/quest-complete.ogg",
      volume: .25
    }), this._controller.addAudio({
      name: "dialogue-quest",
      url: "dialogues/quest.ogg",
      volume: 0,
      autoPlay: !0,
      loop: !0,
      sync: !1
    });
    const i = 2,
      s = 1;
    this._controller.addPositionalAudio({
      name: "dialogue-male1",
      url: "dialogues/male1.ogg",
      volume: 0,
      autoPlay: !1,
      refDistance: i,
      rolloffFactor: s
    }).then(a => this.positionals["dialogue-male1"] = a), this._controller.addPositionalAudio({
      name: "dialogue-male2",
      url: "dialogues/male2.ogg",
      volume: 0,
      autoPlay: !1,
      refDistance: i,
      rolloffFactor: s
    }).then(a => this.positionals["dialogue-male2"] = a), this._controller.addPositionalAudio({
      name: "dialogue-male3",
      url: "dialogues/male3.ogg",
      volume: 0,
      autoPlay: !1,
      refDistance: i,
      rolloffFactor: s
    }).then(a => this.positionals["dialogue-male3"] = a), this._controller.addPositionalAudio({
      name: "dialogue-female1",
      url: "dialogues/female1.ogg",
      volume: 0,
      autoPlay: !1,
      refDistance: i,
      rolloffFactor: s
    }).then(a => this.positionals["dialogue-female1"] = a), this._controller.addPositionalAudio({
      name: "dialogue-female2",
      url: "dialogues/female2.ogg",
      volume: 0,
      autoPlay: !1,
      refDistance: i,
      rolloffFactor: s
    }).then(a => this.positionals["dialogue-female2"] = a), this._controller.addPositionalAudio({
      name: "dialogue-female3",
      url: "dialogues/female3.ogg",
      volume: 0,
      autoPlay: !1,
      refDistance: i,
      rolloffFactor: s
    }).then(a => this.positionals["dialogue-female3"] = a), this._controller.addPositionalAudio({
      name: "dialogue-wtf",
      url: "dialogues/wtf.ogg",
      volume: 0,
      autoPlay: !1,
      refDistance: i,
      rolloffFactor: s
    }).then(a => this.positionals["dialogue-wtf"] = a), this._controller.addPositionalAudio({
      name: "bubble-starts",
      url: "character/bubble-starts.ogg",
      volume: 0,
      autoPlay: !1,
      loop: !1,
      refDistance: 2,
      rolloffFactor: .3
    }).then(a => this.positionals["bubble-starts"] = a), this._controller.addPositionalAudio({
      name: "bubble-ends",
      url: "character/bubble-ends.ogg",
      volume: 0,
      autoPlay: !1,
      loop: !1,
      refDistance: 2,
      rolloffFactor: .3
    }).then(a => this.positionals["bubble-ends"] = a), this._controller.addPositionalAudio({
      name: "dialogue-music-dave",
      url: "music/musician.ogg",
      volume: 0,
      autoPlay: !1,
      loop: !0,
      distanceModel: "linear",
      refDistance: 2.5,
      rolloffFactor: 1,
      maxDistance: 12
    }).then(a => this.positionals["dialogue-music-dave"] = a);
  }
  setAudioVolume(e, i = 1) {
    this._controller.setAudioVolume(e, i);
  }
  playAudio(e) {
    this._controller.playAudio(e);
  }
  stopAudio(e) {
    this._controller.stopAudio(e);
  }
  ensurePositionalVolume(e) {
    e.__animVol === void 0 && (e.__animVol = {
      value: 0
    });
  }
  playPositional(e, i, s = .5, a = 0, o = !1) {
    this.positionals[e] && (i.isWorldNPC && e.startsWith("dialogue") ? (this.ensurePositionalVolume(this.positionals[e]), this._controller.setAudioVolume(e, 0), scope.createTween(this.positionals[e].__animVol, {
      to: {
        value: s
      },
      duration: .2,
      onStart: () => {
        i.add(this.positionals[e]), this.positionals[e].offset = Math.random() * this.positionals[e].buffer.duration, this._controller.playAudio(e, a);
      },
      onUpdate: () => {
        this._controller.setAudioVolume(e, this.positionals[e].__animVol.value);
      }
    })) : o && (i.add(this.positionals[e]), this._controller.setAudioVolume(e, s), this._controller.playAudio(e, a)));
  }
  stopPositional(e, i) {
    this.positionals[e] && (this.ensurePositionalVolume(this.positionals[e]), scope.createTween(this.positionals[e].__animVol, {
      to: {
        value: 0
      },
      duration: .2,
      onUpdate: () => {
        this._controller.setAudioVolume(e, this.positionals[e].__animVol.value);
      },
      onComplete: () => {
        this.positionals[e].removeFromParent(), this._controller.stopAudio(e);
      }
    }));
  }
};
}
