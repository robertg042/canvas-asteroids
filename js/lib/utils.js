var degreesToRadian = function(degrees) {
  return degrees * Math.PI / 180;
};
var radiansToDegrees = function(radians) {
  return radians * 180 / Math.PI;
};
var getRandomInRange = function(min, max) {
  return Math.random() * (max - min) + min;
};
var getRandomIntInclusive = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
};
var convertRange = function(value, r1, r2) {
  return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
};
var randomBM = function(min, max, skew) {
  // random with normal distribution using box-muller algorithm
  // https://stackoverflow.com/a/49434653/9724628
  var u = 0, v = 0;
  while(u === 0) u = Math.random(); // convert [0,1) to (0,1)
  while(v === 0) v = Math.random();
  let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );

  num = num / 10.0 + 0.5; // translate to 0 -> 1
  if (num > 1 || num < 0) num = randomBM(min, max, skew); // resample between 0 and 1 if out of range
  if (skew) num = Math.pow(num, skew); // skew
  num *= max - min; // stretch to fill range
  num += min; // offset to min
  return num;
};

var getDistance = function(p1x, p1y, p2x, p2y) {
  return Math.sqrt(Math.pow((p1x - p2x), 2) + Math.pow((p1y - p2y), 2))
}

var pointCircleHitTest = function(pointX, pointY, circleX, circleY, circleRadius) {
  return getDistance(pointX, pointY, circleX, circleY) <= circleRadius;
}

var lineLineHitTest = function(p1, p2, p3, p4, segmented) {
  let x, y, line1Vertical = false, line2Vertical = false, line1Horizontal = false, line2Horizontal = false;
  // Ax + By + C = 0; y = -(A/B)x - (C/B); a = (y2 - y1) / (x2 - x1)
  let A1 = p1.y - p2.y, B1 = p2.x - p1.x;
  let A2 = p3.y - p4.y, B2 = p4.x - p3.x;
  if (A1 === 0) line1Horizontal = true;
  if (A2 === 0) line2Horizontal = true;
  if (B1 === 0) line1Vertical = true;
  if (B2 === 0) line2Vertical = true;
  if ((line1Horizontal && line2Horizontal) || (line1Vertical && line2Vertical)) return null;
  if (!line1Vertical && !line2Vertical) {
    let C1 = -B1 * (A1/B1 * p1.x + p1.y);
    let C2 = -B2 * (A2/B2 * p3.x + p3.y);
    const denominator = (A1 * B2 - A2 * B1);
    x = (B1 * C2 - B2 * C1) / denominator;
    y = (A2 * C1 - A1 * C2) / denominator;
    if (denominator === 0) return null;
  } else if (line1Vertical) {
    let C2 = -B2 * (A2/B2 * p3.x + p3.y);
    x = p1.x;
    y = -(A2 / B2) * x - (C2 / B2);
  } else if (line2Vertical) {
    let C1 = -B1 * (A1/B1 * p1.x + p1.y);
    x = p3.x;
    y = -(A1 / B1) * x - (C1 / B1);
  }
  if (line1Horizontal) {
    y = p1.y;
  } else if (line2Horizontal) {
    y = p3.y;
  }

  if (segmented) {
    if ((x >= Math.min(p1.x, p2.x) && x <= Math.max(p1.x, p2.x) && y >= Math.min(p1.y, p2.y) && y <= Math.max(p1.y, p2.y)) &&
    (x >= Math.min(p3.x, p4.x) && x <= Math.max(p3.x, p4.x) && y >= Math.min(p3.y, p4.y) && y <= Math.max(p3.y, p4.y))) {
      // intersect point belongs to both segments
      return {x, y};
    } else {
      return null;
    }
  } else {
    return {x, y};
  }
}

var lineCircleHitTest = function(p1, p2, cx, cy, r, segmented) {
  let x, y, line1Vertical = false, line2Vertical = false, line1Horizontal = false, line2Horizontal = false;
  // Ax + By + C = 0; y = -(A/B)x - (C/B); a = (y2 - y1) / (x2 - x1)
  // A1A2 = -B1B2 => A1 = B2; B1 = -A2
  const A1 = p1.y - p2.y, B1 = p2.x - p1.x;
  const A2 = B1, B2 = -A1;

  if (A1 === 0) line1Horizontal = true;
  if (A2 === 0) line2Horizontal = true;
  if (B1 === 0) line1Vertical = true;
  if (B2 === 0) line2Vertical = true;

  if (!line1Vertical && !line2Vertical) {
    const C1 = -B1 * (A1/B1 * p1.x + p1.y);
    const C2 = -A2 * cx + -B2 * cy;
    const denominator = (A1 * B2 - A2 * B1);
    x = (B1 * C2 - B2 * C1) / denominator;
    y = (A2 * C1 - A1 * C2) / denominator;
    if (denominator === 0) return null;
  } else if (line1Vertical) {
    const C2 = -A2 * cx + -B2 * cy;
    x = p1.x;
    y = -(A2 / B2) * x - (C2 / B2);
  } else if (line2Vertical) {
    const C1 = -B1 * (A1/B1 * p1.x + p1.y);
    x = cx;
    y = -(A1 / B1) * x - (C1 / B1);
  }
  if (line1Horizontal) {
    y = p1.y;
  } else if (line2Horizontal) {
    y = cy;
  }

  const dist = getDistance(x, y, cx, cy);
  if (dist > r) {
    return null;
  }

  if (segmented) {
    const angle = Math.atan((p2.y - p1.y) / (p2.x - p1.x));
    const dx = Math.cos(angle) * r;
    const dy = Math.abs(Math.sin(angle) * r);
    // vertices to check against
    const v1 = Math.min(p1.x, p2.x) - dx;
    const v2 = Math.max(p1.x, p2.x) + dx;
    const v3 = Math.min(p1.y, p2.y) - dy;
    const v4 = Math.max(p1.y, p2.y) + dy;
    if ((x >= v1 && x <= v2 && y >= v3 && y <= v4)) {
      // intersect point belongs to line segments
      return {x, y};
    } else {
      return null;
    }
  } else {
    return {x, y};
  }
}