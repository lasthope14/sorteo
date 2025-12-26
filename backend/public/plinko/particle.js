// Hidroobras - Partícula (Gota de agua)
// Basado en Plinko de Daniel Shiffman (Coding Train)

function Particle(x, y, r, nombre, isWinner) {
  this.nombre = nombre || 'Participante';
  this.isWinner = isWinner || false;
  this.finished = false;

  // Color de la gota - azul agua brillante, dorado si es ganador
  this.baseHue = isWinner ? 45 : random(195, 210);
  this.sat = isWinner ? 90 : random(70, 90);
  this.bri = isWinner ? 100 : random(85, 100);

  var options = {
    restitution: 0.5,     // Rebote moderado
    friction: 0.001,      // Muy poca fricción
    frictionAir: 0.0005,  // Casi sin resistencia del aire - caen rápido
    density: 0.8,         // Gotas pesadas que caen bien
    label: 'particle'
  };

  // Pequeña variación en posición inicial
  x += random(-3, 3);

  this.body = Bodies.circle(x, y, r, options);
  this.r = r;
  World.add(world, this.body);
}

Particle.prototype.isOffScreen = function () {
  var y = this.body.position.y;
  return y > height + 100;
};

Particle.prototype.show = function () {
  var pos = this.body.position;
  var angle = this.body.angle;

  push();
  translate(pos.x, pos.y);
  rotate(angle);

  noStroke();

  // === TUERCA HEXAGONAL - SÍMBOLO DE PLOMERÍA ===

  // Sombra
  fill(0, 0, 0, 0.3);
  this.drawHexagon(3, 3, this.r * 1.1);

  // Cuerpo de la tuerca (metal plateado)
  fill(210, 15, 70);
  this.drawHexagon(0, 0, this.r);

  // Borde metálico superior
  fill(210, 10, 85);
  this.drawHexagon(0, 0, this.r * 0.9);

  // Centro de la tuerca (más hueco)
  fill(210, 25, 35);
  ellipse(0, 0, this.r * 0.8);

  // Agujero central grande
  fill(210, 30, 15);
  ellipse(0, 0, this.r * 0.6);

  // Brillo metálico
  fill(0, 0, 100, 0.3);
  ellipse(-this.r * 0.25, -this.r * 0.25, this.r * 0.3, this.r * 0.2);

  pop();

  // Nombre del participante
  this.showName(pos.x, pos.y);
};

// Dibujar hexágono
Particle.prototype.drawHexagon = function (x, y, r) {
  beginShape();
  for (var i = 0; i < 6; i++) {
    var a = TWO_PI / 6 * i - HALF_PI;
    vertex(x + cos(a) * r, y + sin(a) * r);
  }
  endShape(CLOSE);
};

function drawStar(x, y, size, points) {
  push();
  translate(x, y);
  rotate(frameCount * 0.05);
  fill(45, 100, 100);
  noStroke();
  for (var i = 0; i < points * 2; i++) {
    var r = (i % 2 === 0) ? size : size * 0.4;
    var angle = (TWO_PI / (points * 2)) * i - HALF_PI;
    var px = cos(angle) * r;
    var py = sin(angle) * r;
    if (i === 0) {
      beginShape();
    }
    vertex(px, py);
  }
  endShape(CLOSE);
  pop();
}

Particle.prototype.showName = function (x, y) {
  push();

  // Fondo del nombre con gradiente
  var shortName = this.getShortName();
  textSize(10);
  textFont('Outfit');
  var textW = textWidth(shortName) + 12;

  // Fondo redondeado
  fill(0, 0, 0, 0.8);
  noStroke();
  rectMode(CENTER);
  rect(x, y - this.r - 18, textW, 18, 8);

  // Texto
  fill(this.isWinner ? color(45, 90, 100) : 255);
  textAlign(CENTER, CENTER);
  textStyle(this.isWinner ? BOLD : NORMAL);
  text(shortName, x, y - this.r - 18);

  pop();
};

Particle.prototype.getShortName = function () {
  var parts = this.nombre.split(' ');
  if (parts.length >= 2) {
    return parts[0] + ' ' + parts[1].charAt(0) + '.';
  }
  return parts[0];
};
