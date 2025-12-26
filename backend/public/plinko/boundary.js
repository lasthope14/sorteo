// Hidroobras - Límites del tablero
// Basado en Plinko de Daniel Shiffman (Coding Train)

function Boundary(x, y, w, h) {
  var options = {
    isStatic: true,
    friction: 0.3,
    label: 'boundary'
  };

  this.body = Bodies.rectangle(x, y, w, h, options);
  this.w = w;
  this.h = h;
  World.add(world, this.body);
}

Boundary.prototype.show = function () {
  var pos = this.body.position;

  // Solo mostrar los separadores pequeños (slots)
  if (this.w < 20 && this.h > 20) {
    push();
    translate(pos.x, pos.y);

    // Separador metálico
    noStroke();
    fill(210, 30, 40); // Gris azulado
    rectMode(CENTER);
    rect(0, 0, this.w, this.h, 2);

    // Brillo
    fill(210, 20, 55);
    rect(-this.w * 0.2, 0, this.w * 0.3, this.h, 2);

    pop();
  }
};
