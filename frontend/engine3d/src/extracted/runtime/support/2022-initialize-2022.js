/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1586263:1586794.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2022(scope) {
if (scope.initialKeys.length === 0) scope.reset();else {
  for (let r = 0; r < scope.initialKeys.length; r++) {
    const e = scope.initialKeys[r],
      i = scope.progress[e],
      s = scope.QUESTINFO[e];
    if (!Array.isArray(i) || !s || i.length !== s.steps.length) {
      console.warn(`Quest ${e} state does not match the quest info state! Resetting quest progress.`), scope.reset();
      break;
    }
  }
  scope.areAllQuestsCompleted() && scope.reset(), Object.keys(scope.QUESTINFO).forEach(r => {
    if (!scope.progress[r]) return;
    const e = scope.progress[r];
    for (let i = 0; i < e.length; i++) {
      scope.QUESTINFO[r].steps[i] = e[i];
      const s = scope.questData.quests.find(a => a.id === r);
      s.steps[i].completed = e[i];
    }
  });
}
}
