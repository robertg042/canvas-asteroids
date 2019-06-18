class Vector {
  constructor(x = 1, y = 0) {
    this.x = x;
    this.y = y;
  }

  get angle() {
    return this._getAngle();
  }

  set angle(angle) {
    return this._setAngle(angle);
  }

  get length() {
    return this._getLength();
  }

  set length(length) {
    return this._setLength(length);
  }

  _getAngle(x = this.x, y = this.y) {
    return Math.atan2(y, x);
  }

  _setAngle(angle) {
    const length = this._getLength();
    this.x = length * Math.cos(angle);
    this.y = length * Math.sin(angle);
  }

  _getLength(x = this.x, y = this.y) {
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  }

  _setLength(length) {
    const angle = this._getAngle();
    this.x = length * Math.cos(angle);
    this.y = length * Math.sin(angle);
  }

  static add(...vectorsProp) {
    const vectors = [...vectorsProp];
    return vectors.reduce((acc, currentVector) => {
      acc.x += currentVector.x;
      acc.y += currentVector.y;
      return acc;
    }, new Vector(0, 0));
  }

  static convertAngle(angle) {
    // converts angle range [0;Math.PI] and [-Math.PI;0] to [0;2*Math.PI]
    if (angle >= 0) return angle;
    if (angle < 0) return angle + 2 * Math.PI;
  }
}