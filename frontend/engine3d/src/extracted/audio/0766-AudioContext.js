/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 284863:285033.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0766(scope) {
scope.AudioContext = class AudioContext {
  static getContext() {
    return scope._context === void 0 && (scope._context = new (window.AudioContext || window.webkitAudioContext)()), scope._context;
  }
  static setContext(e) {
    scope._context = e;
  }
};
}
