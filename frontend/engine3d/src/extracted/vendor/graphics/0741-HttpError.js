/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 268648:268721.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0741(scope) {
scope.HttpError = class HttpError extends Error {
  constructor(e, i) {
    super(e), this.response = i;
  }
};
}
