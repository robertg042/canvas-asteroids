class Ship extends Particle {
  constructor({x, y, speed, direction, color, accelerateVectors = [], stageWidth}) {
    super({x, y, speed, direction, color, accelerateVectors});
    this.stageWidth = stageWidth;
    this.unitSize = this._getSizeUnit();
    this._paths = null;

    // look - Path2Ds
    this._setView(this.stageWidth);

    // turning
    this._MAX_TURN = 0.03;
    this._isTurningLeft = false;
    this._isTurningRight = false;
    this._currentTurnAngle = 0;

    // thrust
    this._MAX_THRUST = 0.1;
    this._isThrusting = false;
    this.thrust = new Vector(0,0);
    this.accelerateVectors.push(this.thrust);

    this._MAX_SPEED = 5;

    // hitbox
    this.hitbox = this._generateHitbox();
  }

  get paths() {
    return this._paths;
  }

  set isTurningLeft(isTurning) {
    this._isTurningLeft = isTurning;
  }

  set isTurningRight(isTurning) {
    this._isTurningRight = isTurning;
  }

  set isThrusting(isThrusting) {
    if (this._isThrusting === isThrusting) return;
    this._isThrusting = isThrusting;
    this.thrust.length = isThrusting ? this._MAX_THRUST : 0;
  }

  get isThrusting() {
    return this._isThrusting;
  }

  get currentTurnAngle() {
    return this._currentTurnAngle;
  }

  _generateHitbox() {
    const hitbox = {
      vertices: []
    }
    const vertices = [];
    vertices.push(new Vector(-0.25*this.unitSize,-0.5*this.unitSize));
    vertices.push(new Vector(-0.25*this.unitSize,0.5*this.unitSize));
    vertices.push(new Vector(0.45*this.unitSize,0.5*this.unitSize));
    vertices.push(new Vector(0.45*this.unitSize,-0.5*this.unitSize));
    for (let i = 0; i < vertices.length; i++) {
      vertices[i].angle += this._currentTurnAngle;
      hitbox.vertices.push(Vector.add(this.position, this.velocity, vertices[i]));
    }
    return hitbox;
  }

  _generatePaths() {
    const paths = {mainSubpaths: [], thrustPath: null};
    let subpath = new Path2D();
    subpath.moveTo(-0.25*this.unitSize, -0.5*this.unitSize);
    subpath.lineTo(-0.25*this.unitSize, 0.5*this.unitSize);
    subpath.lineTo(0.125*this.unitSize, 0.5*this.unitSize);
    subpath.lineTo(0.25*this.unitSize, 0.375*this.unitSize);
    subpath.lineTo(0.125*this.unitSize, 0.25*this.unitSize);
    subpath.lineTo(0.125*this.unitSize, 0.125*this.unitSize);
    subpath.lineTo(0.375*this.unitSize, 0.125*this.unitSize);
    subpath.lineTo(0.45*this.unitSize, 0);
    subpath.lineTo(0.375*this.unitSize, -0.125*this.unitSize);
    subpath.lineTo(0.125*this.unitSize, -0.125*this.unitSize);
    subpath.lineTo(0.125*this.unitSize, -0.25*this.unitSize);
    subpath.lineTo(0.25*this.unitSize, -0.375*this.unitSize);
    subpath.lineTo(0.125*this.unitSize, -0.5*this.unitSize);
    subpath.lineTo(-0.25*this.unitSize, -0.5*this.unitSize);
    paths.mainSubpaths.push({path: subpath, lineWidth: 0.075*this.unitSize});
    subpath = new Path2D();
    subpath.moveTo(-0.125*this.unitSize, -0.375*this.unitSize);
    subpath.lineTo(-0.125*this.unitSize, 0.375*this.unitSize);
    subpath.moveTo(0, -0.2*this.unitSize);
    subpath.lineTo(0, 0.2*this.unitSize);
    paths.mainSubpaths.push({path: subpath, lineWidth: 0.0375*this.unitSize});
    subpath = new Path2D();
    subpath.moveTo(-0.25*this.unitSize, -0.2*this.unitSize);
    subpath.lineTo(-0.5*this.unitSize, 0);
    subpath.lineTo(-0.25*this.unitSize, 0.2*this.unitSize);
    paths.thrustPath = {path: subpath, lineWidth: 0.025*this.unitSize};
    return paths;
  }

  _getSizeUnit() {
    return 0.03 * this.stageWidth; // percentage of stage width used to scale the ship
  }

  _setView(stageWidth) {
    this.stageWidth = stageWidth;
    this.unitSize = this._getSizeUnit();
    this._paths = this._generatePaths();
  }

  update({stageWidth}) {
    if (this._isTurningLeft && !this._isTurningRight) {
      this._currentTurnAngle = (this._currentTurnAngle - this._MAX_TURN) % (2 * Math.PI);
    } else if (this._isTurningRight && !this._isTurningLeft) {
      this._currentTurnAngle = (this._currentTurnAngle + this._MAX_TURN) % (2 * Math.PI);
    }
    this.thrust.angle = this._currentTurnAngle;
    if (this.velocity.length > this._MAX_SPEED) {
      this.velocity.length = this._MAX_SPEED;
    }

    this.hitbox = this._generateHitbox();

    super.update();
    let scaleFactor = stageWidth / this.stageWidth;
    if (stageWidth !== this.stageWidth) {
      this._setView(stageWidth);
      for (let i = 0; i < this.hitbox.vertices.length; i++) {
        this.hitbox.vertices[i].length *= scaleFactor;
      }
    }
  }
}