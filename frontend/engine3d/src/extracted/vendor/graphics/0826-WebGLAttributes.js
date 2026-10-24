/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 328893:330948.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0826(scope) {
scope.WebGLAttributes = function WebGLAttributes(r) {
  const e = new WeakMap();
  function i(c, h) {
    const d = c.array,
      p = c.usage,
      f = d.byteLength,
      _ = r.createBuffer();
    r.bindBuffer(h, _), r.bufferData(h, d, p), c.onUploadCallback();
    let x;
    if (d instanceof Float32Array) x = r.FLOAT;else if (typeof Float16Array < "u" && d instanceof Float16Array) x = r.HALF_FLOAT;else if (d instanceof Uint16Array) c.isFloat16BufferAttribute ? x = r.HALF_FLOAT : x = r.UNSIGNED_SHORT;else if (d instanceof Int16Array) x = r.SHORT;else if (d instanceof Uint32Array) x = r.UNSIGNED_INT;else if (d instanceof Int32Array) x = r.INT;else if (d instanceof Int8Array) x = r.BYTE;else if (d instanceof Uint8Array) x = r.UNSIGNED_BYTE;else if (d instanceof Uint8ClampedArray) x = r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: " + d);
    return {
      buffer: _,
      type: x,
      bytesPerElement: d.BYTES_PER_ELEMENT,
      version: c.version,
      size: f
    };
  }
  function s(c, h, d) {
    const p = h.array,
      f = h.updateRanges;
    if (r.bindBuffer(d, c), f.length === 0) r.bufferSubData(d, 0, p);else {
      f.sort((x, b) => x.start - b.start);
      let _ = 0;
      for (let x = 1; x < f.length; x++) {
        const b = f[_],
          T = f[x];
        T.start <= b.start + b.count + 1 ? b.count = Math.max(b.count, T.start + T.count - b.start) : (++_, f[_] = T);
      }
      f.length = _ + 1;
      for (let x = 0, b = f.length; x < b; x++) {
        const T = f[x];
        r.bufferSubData(d, T.start * p.BYTES_PER_ELEMENT, p, T.start, T.count);
      }
      h.clearUpdateRanges();
    }
    h.onUploadCallback();
  }
  function a(c) {
    return c.isInterleavedBufferAttribute && (c = c.data), e.get(c);
  }
  function o(c) {
    c.isInterleavedBufferAttribute && (c = c.data);
    const h = e.get(c);
    h && (r.deleteBuffer(h.buffer), e.delete(c));
  }
  function l(c, h) {
    if (c.isInterleavedBufferAttribute && (c = c.data), c.isGLBufferAttribute) {
      const p = e.get(c);
      (!p || p.version < c.version) && e.set(c, {
        buffer: c.buffer,
        type: c.type,
        bytesPerElement: c.elementSize,
        version: c.version
      });
      return;
    }
    const d = e.get(c);
    if (d === void 0) e.set(c, i(c, h));else if (d.version < c.version) {
      if (d.size !== c.array.byteLength) throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");
      s(d.buffer, c, h), d.version = c.version;
    }
  }
  return {
    get: a,
    remove: o,
    update: l
  };
};
}
