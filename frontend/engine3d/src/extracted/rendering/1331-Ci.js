/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 768821:769961.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1331(scope) {
scope.Ci = class Ci {
  constructor(e, i, s, a) {
    this._dataView = void 0, this._littleEndian = void 0, this._offset = void 0, this._dataView = new DataView(e.buffer, e.byteOffset + i, s), this._littleEndian = a, this._offset = 0;
  }
  _nextUint8() {
    const e = this._dataView.getUint8(this._offset);
    return this._offset += 1, e;
  }
  _nextUint16() {
    const e = this._dataView.getUint16(this._offset, this._littleEndian);
    return this._offset += 2, e;
  }
  _nextUint32() {
    const e = this._dataView.getUint32(this._offset, this._littleEndian);
    return this._offset += 4, e;
  }
  _nextUint64() {
    const e = this._dataView.getUint32(this._offset, this._littleEndian) + 4294967296 * this._dataView.getUint32(this._offset + 4, this._littleEndian);
    return this._offset += 8, e;
  }
  _nextInt32() {
    const e = this._dataView.getInt32(this._offset, this._littleEndian);
    return this._offset += 4, e;
  }
  _nextUint8Array(e) {
    const i = new Uint8Array(this._dataView.buffer, this._dataView.byteOffset + this._offset, e);
    return this._offset += e, i;
  }
  _skip(e) {
    return this._offset += e, this;
  }
  _scan(e, i = 0) {
    const s = this._offset;
    let a = 0;
    for (; this._dataView.getUint8(this._offset) !== i && a < e;) a++, this._offset++;
    return a < e && this._offset++, new Uint8Array(this._dataView.buffer, this._dataView.byteOffset + s, a);
  }
};
}
