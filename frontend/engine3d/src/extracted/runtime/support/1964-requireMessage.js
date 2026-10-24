/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1477458:1478212.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1964(scope) {
scope.requireMessage = function requireMessage() {
  if (scope.hasRequiredMessage) return scope.message;
  scope.hasRequiredMessage = 1, scope.message = e;
  var r = scope.requireMinimal();
  function e(i) {
    if (i) for (var s = Object.keys(i), a = 0; a < s.length; ++a) this[s[a]] = i[s[a]];
  }
  return e.create = function (s) {
    return this.$type.create(s);
  }, e.encode = function (s, a) {
    return this.$type.encode(s, a);
  }, e.encodeDelimited = function (s, a) {
    return this.$type.encodeDelimited(s, a);
  }, e.decode = function (s) {
    return this.$type.decode(s);
  }, e.decodeDelimited = function (s) {
    return this.$type.decodeDelimited(s);
  }, e.verify = function (s) {
    return this.$type.verify(s);
  }, e.fromObject = function (s) {
    return this.$type.fromObject(s);
  }, e.toObject = function (s, a) {
    return this.$type.toObject(s, a);
  }, e.prototype.toJSON = function () {
    return this.$type.toObject(this, r.toJSONOptions);
  }, scope.message;
};
}
