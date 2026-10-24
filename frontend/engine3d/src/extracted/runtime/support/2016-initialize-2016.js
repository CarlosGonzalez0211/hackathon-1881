/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1585737:1585844.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2016(scope) {
scope.questData.quests.forEach(r => {
  scope.QUESTINFO[r.id] = {
    text: r.description,
    steps: r.steps.map(e => e.completed === !0)
  };
});
}
