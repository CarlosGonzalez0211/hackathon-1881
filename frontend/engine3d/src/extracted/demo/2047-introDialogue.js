/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1617077:1617445.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2047(scope) {
scope.introDialogue = async function introDialogue() {
  for (let r = 0; r < scope.introTexts.length; r++) {
    const e = scope.miscutils.deferred();
    scope.events$1.once("npc_force_next_dialog", i => {
      e.resolve();
    }), scope.events$1.emit("npc_dialog_open", "intro_sequence", scope.introTexts[r], scope.introData, {}), await e, scope.events$1.emit("npc_dialog_close", "intro_sequence"), await scope.miscutils.wait(.3);
  }
  scope.events$1.emit("npc_dialog_finished", "intro_sequence");
};
}
