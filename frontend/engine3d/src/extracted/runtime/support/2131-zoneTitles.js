/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1805906:1808070.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2131(scope) {
scope.zoneTitles = class zoneTitles {
  constructor(e) {
    this.scene = e, this.globalUI = e.globalUI, this.ready = scope.miscutils.deferred(), this.titles = [], this.titlesData = {
      square: {
        text: "Main Square",
        sphere: new scope.Sphere(new scope.Vector3(25.1548, 11.1266, 2.25704), 8.75)
      },
      factory: {
        text: "Capital Corp.",
        sphere: new scope.Sphere(new scope.Vector3(-7.82486, 4.19171, -29.304), 18.45)
      },
      falls: {
        text: "Smelly Falls",
        sphere: new scope.Sphere(new scope.Vector3(8.09011, -13.7658, -12.4145), 10)
      },
      redhouse: {
        text: "Red Cliff House",
        sphere: new scope.Sphere(new scope.Vector3(-14.4395, -6.11889, 27.0498), 9)
      },
      forest: {
        text: "The Forest",
        sphere: new scope.Sphere(new scope.Vector3(-8.84153, -19.1808, 2.54687), 13)
      },
      graveyard: {
        text: "Lucero Graveyard",
        sphere: new scope.Sphere(new scope.Vector3(27.7006, -14.1946, 13.4392), 8)
      },
      cave: {
        text: "Man's Cave",
        sphere: new scope.Sphere(new scope.Vector3(-21.7063, -6.80204, 6.28998), 5)
      },
      temple: {
        text: "Mountain Temple",
        sphere: new scope.Sphere(new scope.Vector3(-10.1549, 34.7748, -3.82302), 8)
      },
      beach: {
        text: "Scully's Beach",
        sphere: new scope.Sphere(new scope.Vector3(-13.1445, 15.572, -1.75282), 8)
      }
    }, this.prevZone = null, this.currentZone = null, this.init();
  }
  async init() {
    this.titlesCnt = new scope.Group(), this.titlesCnt.name = "zone titles", this.titlesCnt.matrixAutoUpdate = !1, this.scene.add(this.titlesCnt);
    const e = [];
    Object.keys(this.titlesData).forEach(i => {
      const s = new scope.title(this, {
        name: i,
        ...this.titlesData[i]
      });
      this.titles.push(s), e.push(s.ready);
    }), await Promise.all(e), this.resize(), scope.events$1.on("character_broadcast_position", this.checkPlayerPosition, this), scope.events$1.on("character_change_traits_shown", this.hideAll, this), scope.events$1.on("npc_dialog_shown", this.hideAll, this), scope.events$1.on("ui_emojis_toggle", this.hideAll, this), scope.events$1.on("end_screen_show", this.hideAll, this), this.ready.resolve();
  }
  checkPlayerPosition(e) {
    scope._v0.fromArray(e);
    let i = null,
      s = -1;
    const a = Object.keys(this.titlesData);
    for (let o = 0; o < a.length; o++) {
      const l = a[o],
        c = this.titlesData[l].sphere;
      if (c.center.distanceTo(scope._v0) < c.radius) {
        i = l, s = o;
        break;
      }
    }
    if (i !== this.currentZone) {
      const o = i !== this.prevZone;
      if (this.prevZone = this.currentZone, this.currentZone = i, o) {
        const l = this.hideAll() ? .25 : 0;
        scope.events$1.emit("ui_zone_title_show"), this.titles[s].show(l);
      }
    }
  }
  hideAll() {
    let e = !1;
    return this.titles.forEach(i => {
      i.shown && (i.hide(), e = !0);
    }), e;
  }
  resize() {
    this.titles.forEach(e => e.resize());
  }
};
}
