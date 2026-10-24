/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1461994:1462584.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1948(scope) {
scope.requireReader_buffer = function requireReader_buffer() {
  if (scope.hasRequiredReader_buffer) return scope.reader_buffer;
  scope.hasRequiredReader_buffer = 1, scope.reader_buffer = i;
  var r = scope.requireReader();
  (i.prototype = Object.create(r.prototype)).constructor = i;
  var e = scope.requireMinimal();
  function i(s) {
    r.call(this, s);
  }
  return i._configure = function () {
    e.Buffer && (i.prototype._slice = e.Buffer.prototype.slice);
  }, i.prototype.string = function () {
    var a = this.uint32();
    return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + a, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + a, this.len));
  }, i._configure(), scope.reader_buffer;
};
}
