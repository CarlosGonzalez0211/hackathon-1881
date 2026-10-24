/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 29821:30434.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0339(scope) {
scope.EventDispatcher = class EventDispatcher {
  addEventListener(e, i) {
    this._listeners === void 0 && (this._listeners = {});
    const s = this._listeners;
    s[e] === void 0 && (s[e] = []), s[e].indexOf(i) === -1 && s[e].push(i);
  }
  hasEventListener(e, i) {
    const s = this._listeners;
    return s === void 0 ? !1 : s[e] !== void 0 && s[e].indexOf(i) !== -1;
  }
  removeEventListener(e, i) {
    const s = this._listeners;
    if (s === void 0) return;
    const a = s[e];
    if (a !== void 0) {
      const o = a.indexOf(i);
      o !== -1 && a.splice(o, 1);
    }
  }
  dispatchEvent(e) {
    const i = this._listeners;
    if (i === void 0) return;
    const s = i[e.type];
    if (s !== void 0) {
      e.target = this;
      const a = s.slice(0);
      for (let o = 0, l = a.length; o < l; o++) a[o].call(this, e);
      e.target = null;
    }
  }
};
}
