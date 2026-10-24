/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1322564:1322774.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1756(scope) {
scope.hasGroupGaps = function hasGroupGaps(r, e) {
  const i = scope.getTriCount(r),
    s = scope.getRootIndexRanges(r, e).sort((l, c) => l.offset - c.offset),
    a = s[s.length - 1];
  a.count = Math.min(i - a.offset, a.count);
  let o = 0;
  return s.forEach(({
    count: l
  }) => o += l), i !== o;
};
}
