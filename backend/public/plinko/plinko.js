// Hidroobras - Obstáculos tipo Tubería
// Los obstáculos donde rebotan las gotas son tuberías industriales

function Plinko(x, y, r) {
  var options = {
    restitution: 0.7,  // Rebote
    friction: 0.05,
    isStatic: true,
    label: 'plinko'
  };

  this.body = Bodies.circle(x, y, r, options);
  this.r = r;
  this.x = x;
  this.y = y;
  World.add(world, this.body);
}

Plinko.prototype.show = function () {
  var pos = this.body.position;

  push();
  translate(pos.x, pos.y);

  // === TUBERÍA INDUSTRIAL ===
  noStroke();

  // Sombra de la tubería
  fill(0, 0, 0, 0.4);
  ellipse(3, 3, this.r * 2.4);

  // Cuerpo exterior de la tubería (gris metálico oscuro)
  fill(200, 15, 35); // HSB: gris azulado
  ellipse(0, 0, this.r * 2.4);

  // Cuerpo principal de la tubería (gris metálico)
  fill(200, 20, 50);
  ellipse(0, 0, this.r * 2);

  // Interior oscuro de la tubería (el agujero)
  fill(210, 30, 15);
  ellipse(0, 0, this.r * 1.2);

  // Brillo metálico superior izquierdo
  fill(200, 10, 70);
  arc(0, 0, this.r * 1.8, this.r * 1.8, PI + 0.5, PI * 1.8);

  // Reflejo pequeño
  fill(0, 0, 100, 0.3);
  ellipse(-this.r * 0.3, -this.r * 0.3, this.r * 0.4, this.r * 0.3);

  // Tornillos/pernos decorativos (4 en cruz)
  fill(200, 30, 30);
  var boltOffset = this.r * 0.7;
  ellipse(-boltOffset, 0, 4, 4);
  ellipse(boltOffset, 0, 4, 4);
  ellipse(0, -boltOffset, 4, 4);
  ellipse(0, boltOffset, 4, 4);

  pop();
};
