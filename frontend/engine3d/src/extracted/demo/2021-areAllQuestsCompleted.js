/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1586107:1586263.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2021(scope) {
scope.areAllQuestsCompleted = function areAllQuestsCompleted() {
  let r = !0;
  for (const e in scope.progress) {
    for (let i = 0; i < scope.progress[e].length; i++) if (!scope.progress[e][i]) {
      r = !1;
      break;
    }
    if (!r) break;
  }
  return r;
};
}
