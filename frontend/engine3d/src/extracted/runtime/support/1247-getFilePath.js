/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 750796:750875.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1247(scope) {
scope.getFilePath = function getFilePath(r) {
  return `${r.endsWith(".font") ? scope.pathFonts : scope.pathIcons}${r}`;
};
}
