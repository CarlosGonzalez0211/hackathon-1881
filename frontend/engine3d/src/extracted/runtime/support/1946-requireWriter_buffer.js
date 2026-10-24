/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1456984:1457915.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1946(scope) {
scope.requireWriter_buffer = function requireWriter_buffer() {
  if (scope.hasRequiredWriter_buffer) return scope.writer_buffer;
  scope.hasRequiredWriter_buffer = 1, scope.writer_buffer = i;
  var r = scope.requireWriter();
  (i.prototype = Object.create(r.prototype)).constructor = i;
  var e = scope.requireMinimal();
  function i() {
    r.call(this);
  }
  i._configure = function () {
    i.alloc = e._Buffer_allocUnsafe, i.writeBytesBuffer = e.Buffer && e.Buffer.prototype instanceof Uint8Array && e.Buffer.prototype.set.name === "set" ? function (o, l, c) {
      l.set(o, c);
    } : function (o, l, c) {
      if (o.copy) o.copy(l, c, 0, o.length);else for (var h = 0; h < o.length;) l[c++] = o[h++];
    };
  }, i.prototype.bytes = function (o) {
    e.isString(o) && (o = e._Buffer_from(o, "base64"));
    var l = o.length >>> 0;
    return this.uint32(l), l && this._push(i.writeBytesBuffer, l, o), this;
  };
  function s(a, o, l) {
    a.length < 40 ? e.utf8.write(a, o, l) : o.utf8Write ? o.utf8Write(a, l) : o.write(a, l);
  }
  return i.prototype.string = function (o) {
    var l = e.Buffer.byteLength(o);
    return this.uint32(l), l && this._push(s, l, o), this;
  }, i._configure(), scope.writer_buffer;
};
}
