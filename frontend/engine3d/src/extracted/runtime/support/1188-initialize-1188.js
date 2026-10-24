/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 715941:716102.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1188(scope) {
try {
  scope.dataObject = JSON.parse(localStorage.getItem(scope.key) || "{}");
} catch (r) {
  console.warn("Failed to parse localStorage data, resetting to empty object", r), scope.dataObject = {};
}
}
