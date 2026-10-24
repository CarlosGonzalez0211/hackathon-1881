/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 54876:57225.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0384(scope) {
scope.createColorManagement = function createColorManagement() {
  const r = {
      enabled: !0,
      workingColorSpace: scope.LinearSRGBColorSpace,
      spaces: {},
      convert: function (a, o, l) {
        return this.enabled === !1 || o === l || !o || !l || (this.spaces[o].transfer === scope.SRGBTransfer && (a.r = scope.SRGBToLinear(a.r), a.g = scope.SRGBToLinear(a.g), a.b = scope.SRGBToLinear(a.b)), this.spaces[o].primaries !== this.spaces[l].primaries && (a.applyMatrix3(this.spaces[o].toXYZ), a.applyMatrix3(this.spaces[l].fromXYZ)), this.spaces[l].transfer === scope.SRGBTransfer && (a.r = scope.LinearToSRGB(a.r), a.g = scope.LinearToSRGB(a.g), a.b = scope.LinearToSRGB(a.b))), a;
      },
      workingToColorSpace: function (a, o) {
        return this.convert(a, this.workingColorSpace, o);
      },
      colorSpaceToWorking: function (a, o) {
        return this.convert(a, o, this.workingColorSpace);
      },
      getPrimaries: function (a) {
        return this.spaces[a].primaries;
      },
      getTransfer: function (a) {
        return a === scope.NoColorSpace ? scope.LinearTransfer : this.spaces[a].transfer;
      },
      getToneMappingMode: function (a) {
        return this.spaces[a].outputColorSpaceConfig.toneMappingMode || "standard";
      },
      getLuminanceCoefficients: function (a, o = this.workingColorSpace) {
        return a.fromArray(this.spaces[o].luminanceCoefficients);
      },
      define: function (a) {
        Object.assign(this.spaces, a);
      },
      _getMatrix: function (a, o, l) {
        return a.copy(this.spaces[o].toXYZ).multiply(this.spaces[l].fromXYZ);
      },
      _getDrawingBufferColorSpace: function (a) {
        return this.spaces[a].outputColorSpaceConfig.drawingBufferColorSpace;
      },
      _getUnpackColorSpace: function (a = this.workingColorSpace) {
        return this.spaces[a].workingColorSpaceConfig.unpackColorSpace;
      },
      fromWorkingColorSpace: function (a, o) {
        return scope.warnOnce("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."), r.workingToColorSpace(a, o);
      },
      toWorkingColorSpace: function (a, o) {
        return scope.warnOnce("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."), r.colorSpaceToWorking(a, o);
      }
    },
    e = [.64, .33, .3, .6, .15, .06],
    i = [.2126, .7152, .0722],
    s = [.3127, .329];
  return r.define({
    [scope.LinearSRGBColorSpace]: {
      primaries: e,
      whitePoint: s,
      transfer: scope.LinearTransfer,
      toXYZ: scope.LINEAR_REC709_TO_XYZ,
      fromXYZ: scope.XYZ_TO_LINEAR_REC709,
      luminanceCoefficients: i,
      workingColorSpaceConfig: {
        unpackColorSpace: scope.SRGBColorSpace
      },
      outputColorSpaceConfig: {
        drawingBufferColorSpace: scope.SRGBColorSpace
      }
    },
    [scope.SRGBColorSpace]: {
      primaries: e,
      whitePoint: s,
      transfer: scope.SRGBTransfer,
      toXYZ: scope.LINEAR_REC709_TO_XYZ,
      fromXYZ: scope.XYZ_TO_LINEAR_REC709,
      luminanceCoefficients: i,
      outputColorSpaceConfig: {
        drawingBufferColorSpace: scope.SRGBColorSpace
      }
    }
  }), r;
};
}
