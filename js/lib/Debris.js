class Debris extends Particle {
  constructor({x, y, maxSpeed, direction, color, accelerateVectors = [], level, stageWidth}) {
    if (!level) {
      level = Debris.getRandomLevel();
    }
    let speed = (1 - 0.1 * level) * maxSpeed;

    super({x, y, speed, direction, color, accelerateVectors});

    this.level = level;
    this.stageWidth = stageWidth;
    this.sizeUnit = Debris._getSizeUnit(this.stageWidth);
    this.radius = Debris.getRadiusByLevel(this.level, this.stageWidth);

    // look - vertices
    this.vertices = [new Vector(this.radius,0)];
    const verticesNumber = getRandomIntInclusive(7 + this.level * 5, 15 + this.level * 10);
    for (let i = 1; i < verticesNumber; i++) {
      let vertex = new Vector(0,0);
      vertex.length = 0.85 * this.radius + Math.random() * 0.15 * this.radius;
      vertex.angle = (i-1) * (2 * Math.PI / verticesNumber) + Math.random() * (2 * Math.PI / verticesNumber);
      this.vertices.push(vertex);
    }
    this.vertices.sort(function (a, b) {
      return (Vector.convertAngle(a.angle) > Vector.convertAngle(b.angle)) ? 1 : ((Vector.convertAngle(b.angle) > Vector.convertAngle(a.angle)) ? -1 : 0);
    });

    // look - Path2Ds
    this._paths = this._generatePaths();


    // look - rotation
    this._currentTurnAngle = 0;
    this._MAX_TURN = getRandomInRange(-0.04, 0.04);
  }

  get currentTurnAngle() {
    return this._currentTurnAngle;
  }

  get paths() {
    return this._paths;
  }

  _updateView(stageWidth) {
    let scaleFactor = stageWidth / this.stageWidth;
    this.stageWidth = stageWidth;
    this.vertices.forEach(vertex => {
      vertex.length = vertex.length * scaleFactor;
    })
    this.sizeUnit = Debris._getSizeUnit();
    this.radius = Debris.getRadiusByLevel(this.level, this.stageWidth);
    this._paths = this._generatePaths();
  }

  _generatePaths() {
    const paths = [];
    let subpath = new Path2D();

    subpath = new Path2D();
    subpath.moveTo(this.vertices[0].x, 0);
    for (let i = 1; i < this.vertices.length; i++) {
      subpath.lineTo(this.vertices[i].x, this.vertices[i].y);
    }
    subpath.lineTo(this.vertices[0].fromCenter, 0);

    paths.push({path: subpath, lineWidth: 0.075*this.sizeUnit});
    return paths;
  }

  update({stageWidth}) {
    this._currentTurnAngle = (this._currentTurnAngle - this._MAX_TURN) % (2 * Math.PI);
    super.update();

    if (stageWidth !== this.stageWidth) {
      this._updateView(stageWidth);
    }
  }

  static _getSizeUnit(stageWidth) {
    return 0.01 * stageWidth; // percentage of stage width used to scale the debris;
  }

  static getRandomLevel() {
    let level, random = Math.random();
    if (random < 0.1) {
      level = 2;
    } else if (random < 0.5) {
      level = 1;
    } else {
      level = 0;
    }
    return level;
  }

  static getRadiusByLevel(level, stageWidth) {
    const sizeUnit = Debris._getSizeUnit(stageWidth);
    return sizeUnit + level * 0.5*sizeUnit;
  }
}