/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 280482:280815.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0761(scope) {
scope.LoaderUtils = class LoaderUtils {
  static extractUrlBase(e) {
    const i = e.lastIndexOf("/");
    return i === -1 ? "./" : e.slice(0, i + 1);
  }
  static resolveURL(e, i) {
    return typeof e != "string" || e === "" ? "" : (/^https?:\/\//i.test(i) && /^\//.test(e) && (i = i.replace(/(^https?:\/\/[^\/]+).*/i, "$1")), /^(https?:)?\/\//i.test(e) || /^data:.*,.*$/i.test(e) || /^blob:.*$/i.test(e) ? e : i + e);
  }
};
}
