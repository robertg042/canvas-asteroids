window.addEventListener('load', function() {

  game();
  function game() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const cx = width / 2, cy = height / 2;

    const fpsCounter = new FPSCounter({view: ctx, throttleInterval: 1000});

    window.DOM = {
      logs: document.getElementsByClassName('log')
    };

    const debrisCollection = new Set();
    const debrisToBeRemoved = new Set();

    // TODO: When the tab is out of focus than it keeps running (probably no more frequently than 1000ms) but rAF stops
    const debrisGenerationInterval = setInterval(generateDebris, 200);
    // generateDebris();

    function generateDebris() {
      const side = getRandomIntInclusive(1, 4);
      const maxSpeed = 3;
      let x, y, level, angle1, angle2, direction, color, radius;
      level = Debris.getRandomLevel();
      radius = Debris.getRadiusByLevel(level, width);
      color = getRandomIntInclusive(10, 200);
      let x1, y1, x2, y2; // points of vertices of the opposite stage's edge
      if (side === 1) {
        // top
        x = Math.random() * width;
        y = -radius;
        x1 = 0;
        x2 = width;
        y1 = y2 = height;
      } else if (side === 2) {
        // bottom
        x = Math.random() * width;
        y = height + radius;
        x1 = 0;
        x2 = width;
        y1 = y2 = 0;
      } else if (side === 3) {
        // left
        x = -radius;
        y = Math.random() * height;
        x1 = x2 = width;
        y1 = 0;
        y2 = height;
      } else if (side === 4) {
        // right
        x = width + radius;
        y = Math.random() * height;
        x1 = x2 = 0;
        y1 = 0;
        y2 = height;
      }
      if (side !== 4) {
        angle1 = Math.atan2(y1 - y, x1 - x);
        angle2 = Math.atan2(y2 - y, x2 - x);
        direction = randomBM(Math.min(angle1, angle2), Math.max(angle1, angle2));
      } else {
        angle1 = Math.atan((y1 - y) / (x1 - x));
        angle2 = Math.atan((y2 - y) / (x2 - x));
        direction = randomBM(Math.min(angle1, angle2), Math.max(angle1, angle2));
        direction = direction > 0 ? direction - Math.PI : direction + Math.PI;
      }
      const newDebris = new Debris({x, y, maxSpeed, direction, color: `rgb(${color}, ${color}, ${color})`, level, stageWidth: width});
      debrisCollection.add(newDebris);
    }

    const ship = new Ship({x: cx, y: cy, speed: 0, direction: 0, color: `rgb(${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)})`, accelerateVectors: [], stageWidth: width});

    function collisionCheck() {
      debrisCollection.forEach(debris => {
        for (let i = 0; i < ship.hitbox.vertices.length; i++) {
          if(lineCircleHitTest(ship.hitbox.vertices[i], ship.hitbox.vertices[(i+1) % ship.hitbox.vertices.length], debris.position.x, debris.position.y, debris.radius, true)) {
            debrisToBeRemoved.add(debris);
            break;
          }
        }
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      ship.update({stageWidth: width});
      debrisCollection.forEach(debris => {
        debris.update({stageWidth: width});
      });

      collisionCheck();

      // edge wrapping
      if (ship.position.x - 20 > width) {
        ship.position.x = -20;
      } else if (ship.position.x + 20 < 0) {
        ship.position.x = width + 20;
      }
      if (ship.position.y - 20 > height) {
        ship.position.y = -20;
      } else if (ship.position.y + 20 < 0) {
        ship.position.y = height + 20;
      }

      drawShip(ship);

      fpsCounter.update();

      debrisCollection.forEach(debris => {
        drawDebris(debris);
        let x = debris.position.x;
        let y = debris.position.y;
        if (x - debris.radius > width || x + debris.radius < 0 || y - debris.radius > height || y + debris.radius < 0) {
          debrisToBeRemoved.add(debris);
        }
      });
      debrisToBeRemoved.forEach(debris => {
        debrisCollection.delete(debris);
      });
      debrisToBeRemoved.clear();

      requestAnimationFrame(animate);
    };
    animate();

    function drawDebris(debris) {
      let paths = debris.paths;
      ctx.save();
      ctx.strokeStyle = debris.color;
      ctx.fillStyle = debris.color;
      ctx.translate(debris.position.x, debris.position.y);
      ctx.rotate(debris.currentTurnAngle);
      paths.forEach(subpath => {
        ctx.lineWidth = subpath.lineWidth;
        ctx.beginPath();
        ctx.fill(subpath.path);
      });
      ctx.beginPath();
      ctx.arc(0, 0, debris.radius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }

    function drawShipHitbox(ship) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(ship.hitbox.vertices[0].x, ship.hitbox.vertices[0].y);
      ctx.lineTo(ship.hitbox.vertices[1].x, ship.hitbox.vertices[1].y);
      ctx.lineTo(ship.hitbox.vertices[2].x, ship.hitbox.vertices[2].y);
      ctx.lineTo(ship.hitbox.vertices[3].x, ship.hitbox.vertices[3].y);
      ctx.lineTo(ship.hitbox.vertices[0].x, ship.hitbox.vertices[0].y);
      ctx.stroke();
      ctx.restore();
    }

    function drawShip(ship) {
      let paths = ship.paths;
      ctx.save();
      ctx.strokeStyle = ship.color;
      ctx.translate(ship.position.x, ship.position.y);
      ctx.rotate(ship.currentTurnAngle);
      paths.mainSubpaths.forEach(subpath => {
        ctx.lineWidth = subpath.lineWidth;
        ctx.beginPath();
        ctx.stroke(subpath.path);
      });
      if (ship.isThrusting) {
        ctx.lineWidth = paths.thrustPath.lineWidth;
        ctx.stroke(paths.thrustPath.path);
      }
      ctx.restore();
      drawShipHitbox(ship);
    }

    window.addEventListener('keydown', function(e) {
      if (e.keyCode == 37) {
        ship.isTurningLeft = true;
      } else if (e.keyCode == 39) {
        ship.isTurningRight = true;
      } else if (e.keyCode == 38) {
        ship.isThrusting = true;
      }
    });

    window.addEventListener('keyup', function(e) {
      if (e.keyCode == 37) {
        ship.isTurningLeft = false;
      } else if (e.keyCode == 39) {
        ship.isTurningRight = false;
      } else if (e.keyCode == 38) {
        ship.isThrusting = false;
      }
    });

    window.addEventListener('resize', function(e) {
      let canvas = document.getElementById('canvas');
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    });
  }


});