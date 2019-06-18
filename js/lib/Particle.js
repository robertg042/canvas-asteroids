class Particle {
  constructor({x = 0, y = 0, speed = 0, direction = 0, color = 'rgb(0,0,0)', accelerateVectors = []}) {
    this.position = new Vector(x, y);
    this.velocity = new Vector(0,0);
    this.velocity.length = speed;
    this.velocity.angle = direction;
    this.accelerateVectors = accelerateVectors;
    this.color = color;
  }

  accelerate(accelerateVectors) {
    this.velocity = Vector.add(this.velocity, ...accelerateVectors);
  }

  update() {
    this.accelerate(this.accelerateVectors);
    this.position = Vector.add(this.position, this.velocity);
  }
}