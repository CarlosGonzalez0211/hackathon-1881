/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1753217:1770788.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2115(scope) {
scope.presentScene = class presentScene extends scope.planet {
  constructor(e) {
    const i = [[5.81095, 5.80205, 25.7794], [13.9316, 19.3062, 8.38147]],
      s = [Math.PI * .625, Math.PI * .55],
      a = [1.15, 1.15],
      o = Math.floor(Math.random() * i.length);
    super(e, {
      terrain: "present",
      charPosition: i[o],
      charRotation: s[o],
      charRadius: a[o],
      roomPrefix: "planet-present",
      hemisphereOptions: ["#25577c", "#2f2f2f", .7],
      cmsOptions: ["#ffffff", 3]
    });
  }
  async init() {
    scope.client$1.devScene && (this._devAudioController = new scope.audioController(this.mainController), this._devAudioController.camera = this.camera), await Promise.all([...[{
      objClass: scope.water,
      name: "water"
    }, {
      objClass: scope.waterfallvfx,
      name: "waterfallvfx"
    }, {
      objClass: scope.beachwavevfx,
      name: "beachwavevfx"
    }, {
      objClass: scope.cables,
      name: "cables"
    }, {
      objClass: scope.smokevfx,
      name: "smokevfx"
    }, {
      objClass: scope.sky,
      name: "sky"
    }, {
      objClass: scope.grass$1,
      name: "grass"
    }, {
      objClass: scope.butterflies,
      name: "butterflies"
    }, {
      objClass: scope.grass,
      name: "treeleaves"
    }, {
      objClass: scope.birds,
      name: "birds",
      options: {
        count: 15,
        groups: 5,
        curve: "birds/curve-1.drc",
        bird: "birds/1.drc"
      }
    }, {
      objClass: scope.birds,
      name: "birds2",
      options: {
        count: 20,
        groups: 5,
        curve: "birds/curve-2.drc",
        bird: "birds/2.drc",
        multiplier: 1.25,
        speed: .7,
        direction: -1
      }
    }].map(({
      objClass: e,
      name: i,
      options: s = {}
    }) => (this[i] = new e(this, s), this[i].ready)), this.createNPCS()]), scope.client$1.devScene ? (console.warn("ignore webgl errors on dev, they come from the water being added to the GUI."), this.add(this.water.mesh), this.add(this.beachwavevfx.mesh), this.ready.then(() => this.addWateryElements())) : (this.addWateryElements(), this.anyStepInitiated = scope.anyStepInitiated);
  }
  addWateryElements() {
    this.waterScene.add(this.water.mesh), this.waterScene.add(this.waterfallvfx.mesh), this.waterScene.add(this.waterfallvfx.mesh2), this.waterScene.add(this.waterfallvfx.mesh3), this.waterScene.add(this.beachwavevfx.mesh);
  }
  async createNPCS() {
    this.npcs = [], this.npcs.push(new scope.npc(this, {
      id: "office-worker",
      modelURL: "npcs/present/office-worker/office-worker-alt.drc",
      bonesURL: "npcs/present/office-worker/office-worker-bones.drc",
      animations: ["npcs/present/office-worker/office-worker-idle.drc", "npcs/present/office-worker/office-worker-talk.drc", "npcs/present/office-worker/office-worker-idle.drc", "npcs/present/office-worker/office-worker-walk-alt.drc"],
      animationsOptions: [{
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }],
      curve: "npcs/present/tall-man-curve.drc",
      curveSpeed: .52,
      curveProgress: 0,
      curveSpeedAnimationWeight: 1,
      texts: ["Sorry, I'm on my lunch break."],
      alwaysFaceCharacter: !1,
      talkFacingPlayer: !1,
      position: [27.9744, 1.40907, .538691],
      rotation: [0, 0, scope.math.radians(-88.6297)],
      textsBubblesOffset: [0, .6, .05],
      visibilityThreshold: 20,
      extraData: {
        name: "Walking Man",
        color: "#66BDE6"
      }
    })), this.npcs.push(new scope.npc(this, {
      id: "office-worker-2",
      modelURL: "npcs/present/office-worker/office-worker.drc",
      bonesURL: "npcs/present/office-worker/office-worker-bones.drc",
      animations: ["npcs/present/office-worker/office-worker-idle.drc", "npcs/present/office-worker/office-worker-talk.drc", "npcs/present/office-worker/office-worker-idle-talk.drc", "npcs/present/office-worker/office-worker-walk.drc"],
      animationsOptions: [{
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }],
      texts: ["Senior associate executive chief vice director...", "It has a nice ring to it, don't you think?"],
      alwaysFaceCharacter: !1,
      talkFacingPlayer: !0,
      position: [26.2539, 9.70977, 1.39919],
      rotation: [scope.math.radians(3.52382), scope.math.radians(-.260877), scope.math.radians(-69.5392)],
      textsBubblesOffset: [0, .65, .1],
      visibilityThreshold: 20,
      icon: !0,
      iconOffset: [0, .1, .1],
      extraData: {
        name: "Office Worker",
        color: "#c25959",
        voice: "male3"
      }
    })), this.npcs.push(new scope.npc(this, {
      id: "chef",
      modelURL: "npcs/present/chef/chef.drc",
      bonesURL: "npcs/present/chef/chef-bones.drc",
      animations: ["npcs/present/chef/chef-idle.drc", "npcs/present/chef/chef-idle.drc", "npcs/present/chef/chef-idle.drc", "npcs/present/chef/chef-idle.drc"],
      animationsOptions: [{
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }],
      texts: ["Have you seen my daughter? I thought she'd be home by now..."],
      alwaysFaceCharacter: !1,
      talkFacingPlayer: !1,
      position: [20.3565, 19.1747, 2.20046],
      rotation: [scope.math.radians(63.916), scope.math.radians(41.5698), scope.math.radians(-67.6105)],
      textsBubblesOffset: [.2, .25, .3],
      lookatOffset: [0, -.2, 0],
      visibilityThreshold: 20,
      extraData: {
        name: "Shop Keeper",
        color: "#66BDE6",
        voice: "male2"
      }
    })), this.npcs.push(new scope.npc(this, {
      id: "caveman",
      modelURL: "npcs/present/caveman/caveman.drc",
      bonesURL: "npcs/present/caveman/caveman-bones.drc",
      animations: ["npcs/present/caveman/caveman-idle.drc", "npcs/present/caveman/caveman-idle.drc", "npcs/present/caveman/caveman-idle.drc", "npcs/present/caveman/caveman-idle.drc"],
      animationsOptions: [{
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }],
      texts: ["Maybe I should just call in sick..."],
      alwaysFaceCharacter: !1,
      talkFacingPlayer: !1,
      position: [-22.9825, -3.72729, 4.71889],
      rotation: [scope.math.radians(44.1775), scope.math.radians(26.6551), scope.math.radians(93.4536)],
      textsBubblesOffset: [0, .25, 0],
      lookatOffset: [0, -.3, 0],
      visibilityThreshold: 20,
      icon: !0,
      iconOffset: [0, -.35, 0],
      extraData: {
        name: "Cave Man",
        color: "#f3c258",
        voice: "male3"
      }
    })), this.npcs.push(new scope.npc(this, {
      id: "boss",
      modelURL: "npcs/present/boss/boss.drc",
      bonesURL: "npcs/present/boss/boss-bones.drc",
      animations: ["npcs/present/boss/boss-idle.drc", "npcs/present/boss/boss-idle.drc", "npcs/present/boss/boss-idle.drc", "npcs/present/boss/boss-idle.drc"],
      animationsOptions: [{
        speed: .9
      }, {
        speed: .9
      }, {
        speed: .9
      }, {
        speed: .9
      }],
      texts: ["Oh my..."],
      alwaysFaceCharacter: !1,
      talkFacingPlayer: !1,
      position: [-4.04907, 1.05824, 25.4517],
      rotation: [scope.math.radians(223.52), scope.math.radians(-619.507), scope.math.radians(-132.333)],
      textsBubblesOffset: [0, .5, 0],
      lookatOffset: [0, -.1, 0],
      visibilityThreshold: 30,
      talkDistance: 2.2,
      icon: !0,
      iconOffset: [0, 0, 0],
      extraData: {
        name: "Boss",
        color: "#c25959",
        voice: "male1"
      }
    })), this.npcs.push(new scope.npc(this, {
      id: "flower-lady",
      modelURL: "npcs/present/young-lady/young-lady.drc",
      bonesURL: "npcs/present/young-lady/young-lady-bones.drc",
      animations: ["npcs/present/young-lady/young-lady-idle.drc", "npcs/present/young-lady/young-lady-talk.drc", "npcs/present/young-lady/young-lady-talk-idle.drc", "npcs/present/young-lady/young-lady-idle.drc"],
      animationsOptions: [{
        speed: .75
      }, {
        speed: 1.1
      }, {
        speed: 1
      }, {
        speed: 1
      }],
      texts: ["Tulips can take a while to bloom."],
      alwaysFaceCharacter: !1,
      talkFacingPlayer: !1,
      position: [27.4269, 4.65974, 3.58217],
      rotation: [scope.math.radians(283.815), scope.math.radians(-192.997), scope.math.radians(-266.012)],
      textsBubblesOffset: [0, 0, -.2],
      lookatOffset: [0, -.5, 0],
      visibilityThreshold: 20,
      icon: !0,
      iconOffset: [.1, -.6, .1],
      extraData: {
        name: "Flower Lady",
        color: "#f3c258",
        voice: "female2"
      }
    })), this.npcs.push(new scope.npc(this, {
      id: "scout",
      modelURL: "npcs/present/scout/scout.drc",
      bonesURL: "npcs/present/scout/scout-bones.drc",
      animations: ["npcs/present/scout/scout-idle.drc", "npcs/present/scout/scout-idle.drc", "npcs/present/scout/scout-idle.drc", "npcs/present/scout/scout-idle.drc"],
      animationsOptions: [{
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }],
      texts: ["I think I hear my dad calling..."],
      alwaysFaceCharacter: !1,
      talkFacingPlayer: !1,
      position: [-8.91062, -21.1061, .906382],
      rotation: [scope.math.radians(62.3308), scope.math.radians(62.6945), scope.math.radians(119.524)],
      textsBubblesOffset: [-.15, .5, 0],
      visibilityThreshold: 20,
      extraData: {
        name: "Young Kid",
        color: "#66BDE6",
        voice: "female3"
      }
    })), this.npcs.push(new scope.npc(this, {
      id: "threekid",
      modelURL: "npcs/present/threekid/threekid.drc",
      bonesURL: "npcs/present/threekid/threekid-bones.drc",
      animations: ["npcs/present/threekid/threekid-idle.drc", "npcs/present/threekid/threekid-idle.drc", "npcs/present/threekid/threekid-idle.drc", "npcs/present/threekid/threekid-idle.drc"],
      animationsOptions: [{
        speed: .9
      }, {
        speed: .9
      }, {
        speed: .9
      }, {
        speed: .9
      }],
      texts: ["Hello.", "Have you heard of a thing called three.js?", "Well... I suppose most people don't know about 3D experiences.", "They're an art form that combines creativity and technology.", "It's like painting, but with code!"],
      alwaysFaceCharacter: !1,
      talkFacingPlayer: !1,
      position: [30.0128, 18.6118, -4.71063],
      rotation: [scope.math.radians(-194.873), scope.math.radians(-5.41632), scope.math.radians(241.095)],
      textsBubblesOffset: [0, .4, 0],
      visibilityThreshold: 20,
      extraData: {
        name: "Hacker Girl",
        color: "#66BDE6",
        voice: "female3"
      }
    })), this.npcs.push(new scope.npc(this, {
      id: "factory-worker-a",
      modelURL: "npcs/present/factory-worker-a/factory-worker-a.drc",
      bonesURL: "npcs/present/factory-worker-a/factory-worker-a-bones.drc",
      animations: ["npcs/present/factory-worker-a/factory-worker-a-idle.drc", "npcs/present/factory-worker-a/factory-worker-a-idle.drc", "npcs/present/factory-worker-a/factory-worker-a-idle.drc", "npcs/present/factory-worker-a/factory-worker-a-idle.drc"],
      animationsOptions: [{
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }],
      texts: ["Shipments in... shipments out..."],
      alwaysFaceCharacter: !1,
      talkFacingPlayer: !0,
      position: [4.16546, 4.2699, -23.5919],
      rotation: [scope.math.radians(-108.186), scope.math.radians(-253.3), scope.math.radians(27.7728)],
      textsBubblesOffset: [0, .6, 0],
      visibilityThreshold: 20,
      icon: !0,
      iconOffset: [0, .1, 0],
      extraData: {
        name: "Factory Worker",
        color: "#66BDE6",
        voice: "male1"
      }
    })), this.npcs.push(new scope.npc(this, {
      id: "factory-worker-b",
      modelURL: "npcs/present/factory-worker-b/factory-worker-b.drc",
      bonesURL: "npcs/present/factory-worker-b/factory-worker-b-bones.drc",
      animations: ["npcs/present/factory-worker-b/factory-worker-b-walk.drc", "npcs/present/factory-worker-b/factory-worker-b-talk.drc", "npcs/present/factory-worker-b/factory-worker-b-walk.drc", "npcs/present/factory-worker-b/factory-worker-b-walk.drc"],
      animationsOptions: [{
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }],
      curve: "npcs/present/factory-worker-b/curve-1.drc",
      curveSpeed: .52,
      curveProgress: 0,
      curveSpeedAnimationWeight: 1,
      texts: ["The new guy is late again."],
      alwaysFaceCharacter: !1,
      talkFacingPlayer: !1,
      position: [27.9744, 1.40907, .538691],
      rotation: [0, 0, scope.math.radians(-88.6297)],
      textsBubblesOffset: [0, .6, .1],
      visibilityThreshold: 20,
      extraData: {
        name: "Tengo",
        color: "#66BDE6",
        voice: "male1"
      }
    })), this.npcs.push(new scope.npc(this, {
      id: "female-scientist",
      modelURL: "npcs/present/female-scientist/female-scientist.drc",
      bonesURL: "npcs/present/female-scientist/female-scientist-bones.drc",
      animations: ["npcs/present/female-scientist/female-scientist-idle.drc", "npcs/present/female-scientist/female-scientist-idle.drc", "npcs/present/female-scientist/female-scientist-idle.drc", "npcs/present/female-scientist/female-scientist-idle.drc"],
      animationsOptions: [{
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }],
      texts: ["We'll need to build here... here... and also here..."],
      alwaysFaceCharacter: !1,
      talkFacingPlayer: !1,
      position: [-7.46008, -7.60516, -19.6894],
      rotation: [scope.math.radians(-181.522), scope.math.radians(-289.583), scope.math.radians(72.0513)],
      textsBubblesOffset: [0, .6, 0],
      visibilityThreshold: 20,
      icon: !0,
      iconOffset: [0, .1, 0],
      extraData: {
        name: "Doctor Frebi",
        color: "#66BDE6",
        voice: "female1"
      }
    })), this.npcs.push(new scope.npc(this, {
      id: "factory-worker-c",
      modelURL: "npcs/present/factory-worker-c/factory-worker-c.drc",
      bonesURL: "npcs/present/factory-worker-c/factory-worker-c-bones.drc",
      animations: ["npcs/present/factory-worker-c/factory-worker-c-idle.drc", "npcs/present/factory-worker-c/factory-worker-c-idle.drc", "npcs/present/factory-worker-c/factory-worker-c-idle.drc", "npcs/present/factory-worker-c/factory-worker-c-idle.drc"],
      animationsOptions: [{
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }],
      talkEnabled: !1,
      texts: [""],
      alwaysFaceCharacter: !1,
      talkFacingPlayer: !1,
      position: [-7.33081, -8.43986, -19.3465],
      rotation: [scope.math.radians(-214.607), scope.math.radians(-292.8), scope.math.radians(99.0508)],
      textsBubblesOffset: [0, .6, 0],
      visibilityThreshold: 20,
      extraData: {
        name: "Getave",
        color: "#66BDE6",
        voice: "male1"
      }
    })), this.npcs.push(new scope.npc(this, {
      id: "alien",
      modelURL: "npcs/present/alien/alien.drc",
      bonesURL: "npcs/present/alien/alien-bones.drc",
      animations: ["npcs/present/alien/alien-idle.drc", "npcs/present/alien/alien-idle.drc", "npcs/present/alien/alien-idle.drc", "npcs/present/alien/alien-idle.drc"],
      animationsOptions: [{
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }],
      texts: ["I think I've seen you somewhere before..."],
      alwaysFaceCharacter: !1,
      talkFacingPlayer: !1,
      position: [-12.6363, 17.6926, -5.86315],
      rotation: [scope.math.radians(-240.935), scope.math.radians(-412.19), scope.math.radians(125.999)],
      textsBubblesOffset: [0, -.35, -.7],
      visibilityThreshold: 15,
      extraData: {
        name: "Pale Man",
        color: "#66BDE6",
        voice: "wtf"
      }
    })), this.npcs.push(new scope.npc(this, {
      id: "male-scientist",
      modelURL: "npcs/present/male-scientist/male-scientist.drc",
      bonesURL: "npcs/present/male-scientist/male-scientist-bones.drc",
      animations: ["npcs/present/male-scientist/male-scientist-idle.drc", "npcs/present/male-scientist/male-scientist-idle.drc", "npcs/present/male-scientist/male-scientist-idle.drc", "npcs/present/male-scientist/male-scientist-idle.drc"],
      animationsOptions: [{
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }],
      texts: ["Let's see... First I'll need to calculate the radius of the bike tire..."],
      alwaysFaceCharacter: !1,
      talkFacingPlayer: !1,
      position: [10.8494, 23.3367, -7.73384],
      rotation: [scope.math.radians(-26.3333), scope.math.radians(-568.175), scope.math.radians(25.2803)],
      textsBubblesOffset: [0, .65, .2],
      visibilityThreshold: 20,
      icon: !0,
      iconOffset: [0, .05, .1],
      extraData: {
        name: "Doctor Frieb",
        color: "#66BDE6",
        voice: "male3"
      }
    })), this.npcs.push(new scope.npc(this, {
      id: "diver",
      modelURL: "npcs/present/diver/diver.drc",
      bonesURL: "npcs/present/diver/diver-bones.drc",
      animations: ["npcs/present/diver/diver-idle.drc", "npcs/present/diver/diver-talk.drc", "npcs/present/diver/diver-talk-idle.drc", "npcs/present/diver/diver-idle.drc"],
      animationsOptions: [{
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }],
      texts: ["Come on... open up..."],
      alwaysFaceCharacter: !1,
      talkFacingPlayer: !1,
      position: [15.8793, 16.9006, 11.2543],
      rotation: [scope.math.radians(27.0449), scope.math.radians(-548.584), scope.math.radians(36.7925)],
      textsBubblesOffset: [0, -.2, .4],
      lookatOffset: [0, -.5, 0],
      visibilityThreshold: 20,
      icon: !0,
      iconOffset: [0, -.65, .3],
      talkDistance: 2.2,
      extraData: {
        name: "Captain Steve",
        color: "#de794e",
        voice: "male3"
      }
    })), this.npcs.push(new scope.npc(this, {
      id: "mountainman",
      modelURL: "npcs/present/mountainman/mountainman.drc",
      bonesURL: "npcs/present/mountainman/mountainman-bones.drc",
      animations: ["npcs/present/mountainman/mountainman-idle.drc", "npcs/present/mountainman/mountainman-idle.drc", "npcs/present/mountainman/mountainman-idle.drc", "npcs/present/mountainman/mountainman-idle.drc"],
      animationsOptions: [{
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }],
      texts: ["Do you hear that sound? Silence...", "I mean, there's the wind chimes too, but it's mostly silence..."],
      alwaysFaceCharacter: !1,
      talkFacingPlayer: !1,
      position: [-8.17226, 32.3472, -1.76941],
      rotation: [scope.math.radians(22.0663), scope.math.radians(-603.63), scope.math.radians(-31.9016)],
      textsBubblesOffset: [0, -.2, 0],
      lookatOffset: [0, -.5, 0],
      visibilityThreshold: 20,
      icon: !0,
      iconOffset: [0, -.8, 0],
      extraData: {
        name: "Mountain Guy",
        color: "#8cc48c",
        voice: "male3"
      }
    })), this.npcs.push(new scope.npc(this, {
      id: "oldwoman",
      modelURL: "npcs/present/oldwoman/oldwoman.drc",
      bonesURL: "npcs/present/oldwoman/oldwoman-bones.drc",
      animations: ["npcs/present/oldwoman/oldwoman-idle.drc", "npcs/present/oldwoman/oldwoman-idle.drc", "npcs/present/oldwoman/oldwoman-idle.drc", "npcs/present/oldwoman/oldwoman-idle.drc"],
      animationsOptions: [{
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }],
      texts: ["Thank you for delivering my offering."],
      alwaysFaceCharacter: !1,
      talkFacingPlayer: !1,
      position: [23.3711, -16.514, 12.462],
      rotation: [scope.math.radians(100.498), scope.math.radians(-564.362), scope.math.radians(62.4696)],
      textsBubblesOffset: [0, .3, 0],
      lookatOffset: [0, 0, 0],
      visibilityThreshold: 20,
      icon: !0,
      iconOffset: [0, .2, 0],
      extraData: {
        name: "Old Woman",
        color: "#8cc48c",
        voice: "female1"
      }
    })), this.npcs.push(new scope.npc(this, {
      id: "musician",
      modelURL: "npcs/present/musician/musician.drc",
      bonesURL: "npcs/present/musician/musician-bones.drc",
      animations: ["npcs/present/musician/musician-idle.drc", "npcs/present/musician/musician-talk.drc", "npcs/present/musician/musician-idle.drc", "npcs/present/musician/musician-idle.drc"],
      animationsOptions: [{
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }],
      texts: ["Have you heard this one before?"],
      alwaysFaceCharacter: !1,
      talkFacingPlayer: !1,
      position: [15.0288, -14.7864, -7.09569],
      rotation: [scope.math.radians(-194.842), scope.math.radians(-580.277), scope.math.radians(55.2642)],
      textsBubblesOffset: [0, .4, 0],
      lookatOffset: [0, -.5, 0],
      visibilityThreshold: 20,
      icon: !0,
      iconOffset: [0, -.1, 0],
      extraData: {
        name: "Dave the Musician",
        color: "#de794e",
        voice: "male2"
      }
    })), this.npcs.push(new scope.npc(this, {
      id: "fox",
      modelURL: "npcs/present/fox/fox.drc",
      bonesURL: "npcs/present/fox/fox-bones.drc",
      animations: ["npcs/present/fox/fox-idle.drc", "npcs/present/fox/fox-idle.drc", "npcs/present/fox/fox-idle.drc", "npcs/present/fox/fox-idle.drc"],
      animationsOptions: [{
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }],
      talkEnabled: !1,
      texts: [""],
      alwaysFaceCharacter: !1,
      talkFacingPlayer: !1,
      position: [-8.36976, -20.368, 10.0339],
      rotation: [scope.math.radians(224.014), scope.math.radians(-796.511), scope.math.radians(56.1696)],
      textsBubblesOffset: [0, .6, 0],
      visibilityThreshold: 20,
      extraData: {
        name: "Fox",
        color: "#66BDE6",
        voice: "male1"
      }
    })), this.npcs.push(new scope.npc(this, {
      id: "owl",
      modelURL: "npcs/present/owl/owl.drc",
      bonesURL: "npcs/present/owl/owl-bones.drc",
      animations: ["npcs/present/owl/owl-idle.drc", "npcs/present/owl/owl-idle.drc", "npcs/present/owl/owl-idle.drc", "npcs/present/owl/owl-idle.drc"],
      animationsOptions: [{
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }, {
        speed: 1
      }],
      talkEnabled: !1,
      texts: [""],
      alwaysFaceCharacter: !1,
      talkFacingPlayer: !1,
      position: [-12.6002, -22.7506, -2.19052],
      rotation: [scope.math.radians(544.177), scope.math.radians(-551.047), scope.math.radians(-23.0782)],
      textsBubblesOffset: [0, .6, 0],
      visibilityThreshold: 20,
      extraData: {
        name: "Owl",
        color: "#66BDE6",
        voice: "male1"
      }
    })), await Promise.all(this.npcs.map(e => e.ready));
  }
  initQuests() {
    this.questsController = new scope.questsController(this);
  }
  playInAnimation() {
    const e = this.npcs.find(i => {
      var s;
      return ((s = i.mesh) == null ? void 0 : s._id) === "musician";
    });
    return e && scope.events$1.emit("webgl_play_positional", "dialogue-music-dave", e.mesh, .1, 0, !1), scope.events$1.on("npc_talk_update", ({
      id: i,
      object: s,
      talking: a
    }) => {
      i === "musician" && (a ? scope.events$1.emit("webgl_stop_positional", "dialogue-music-dave") : scope.events$1.emit("webgl_play_positional", "dialogue-music-dave", s, .1, 0, !1));
    }), super.playInAnimation();
  }
};
}
