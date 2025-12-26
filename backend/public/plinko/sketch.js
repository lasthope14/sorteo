// Hidroobras - Gran Carrera de Gotas
// Basado en Plinko de Daniel Shiffman (Coding Train)
// Adaptado para sorteo con nombres de participantes

// Matter.js aliases
var Engine = Matter.Engine,
  World = Matter.World,
  Events = Matter.Events,
  Bodies = Matter.Bodies;

var engine;
var world;
var particles = [];
var plinkos = [];
var bounds = [];
var cols = 10;
var rows = 8;  // Balance perfecto

// Hidroobras - Participantes
var participantes = [];
var finishOrder = [];
var raceStarted = false;
var raceEnded = false;
var winner = null;
var ganadorForzado = null;
var premioActual = 'Premio';
var premioImagenActual = null;
var premiosDisponibles = [];

// Colors - Hidroobras Theme
var waterBlue;
var darkBlue;
var gold;

function preload() {
  // ding = loadSound('ding.mp3');
}

function setup() {
  var canvas = createCanvas(900, 600);
  canvas.parent('game-container');

  colorMode(HSB, 360, 100, 100);
  waterBlue = color(195, 80, 90);
  darkBlue = color(210, 70, 20);
  gold = color(45, 90, 100);

  engine = Engine.create();
  world = engine.world;
  world.gravity.y = 0.8;

  // Colisión con el fondo (meta)
  Events.on(engine, 'collisionStart', handleCollision);

  // Crear obstáculos Plinko
  createPlinkoBoard();

  // Crear límites
  createBoundaries();

  // Cargar datos
  loadData();
}

function createPlinkoBoard() {
  var spacing = width / cols;
  var startY = 90;

  for (var j = 0; j < rows; j++) {
    for (var i = 0; i < cols + 1; i++) {
      var x = i * spacing;
      if (j % 2 == 0) {
        x += spacing / 2;
      }
      var y = startY + j * 55;  // Espacio equilibrado
      var p = new Plinko(x, y, 10);  // Tamaño equilibrado
      plinkos.push(p);
    }
  }
}

function createBoundaries() {
  var spacing = width / cols;

  // Suelo
  var b = new Boundary(width / 2, height + 30, width, 60);
  bounds.push(b);

  // Paredes laterales
  bounds.push(new Boundary(-10, height / 2, 20, height));
  bounds.push(new Boundary(width + 10, height / 2, 20, height));

  // Separadores de slots en el fondo (para crear casillas)
  for (var i = 0; i < cols + 2; i++) {
    var x = i * spacing;
    var h = 80;
    var w = 6;
    var y = height - h / 2;
    var bb = new Boundary(x, y, w, h);
    bounds.push(bb);
  }
}

async function loadData() {
  try {
    // Cargar participantes del backend
    var response = await fetch('/api/participantes');
    var data = await response.json();
    participantes = data.map(p => ({ id: p.id, nombre: p.nombre }));

    document.getElementById('participant-count').textContent = participantes.length;

    // Cargar premios (con imágenes)
    var premioRes = await fetch('/api/premios/disponibles');
    premiosDisponibles = await premioRes.json();

    var select = document.getElementById('prize-select');
    select.innerHTML = premiosDisponibles.map(p =>
      '<option value="' + p.id + '" data-imagen="' + (p.imagen || '') + '">' + p.nombre + '</option>'
    ).join('');

    document.getElementById('prize-count').textContent = premiosDisponibles.length;
    document.getElementById('start-btn').disabled = false;

  } catch (error) {
    console.error('Error cargando datos:', error);
    // Datos de prueba
    participantes = [
      { id: 1, nombre: 'Juan Pérez' },
      { id: 2, nombre: 'María García' },
      { id: 3, nombre: 'Carlos López' },
      { id: 4, nombre: 'Ana Rodríguez' },
      { id: 5, nombre: 'Pedro Martínez' },
      { id: 6, nombre: 'Laura Sánchez' },
      { id: 7, nombre: 'Diego Torres' },
      { id: 8, nombre: 'Sofía Ramírez' },
      { id: 9, nombre: 'Andrés Vargas' },
      { id: 10, nombre: 'Camila Morales' }
    ];

    document.getElementById('participant-count').textContent = participantes.length;
    document.getElementById('prize-select').innerHTML = '<option value="1">Premio Demo</option>';
    document.getElementById('prize-count').textContent = '1';
    document.getElementById('start-btn').disabled = false;
  }
}

async function startRace() {
  if (raceStarted) return;

  // Obtener premio seleccionado
  var premioSelect = document.getElementById('prize-select');
  var premioId = premioSelect.value;
  var selectedOption = premioSelect.selectedOptions[0];
  premioActual = selectedOption ? selectedOption.text : 'Premio';
  premioImagenActual = selectedOption ? selectedOption.getAttribute('data-imagen') : null;

  if (!premioId) {
    alert('Por favor selecciona un premio');
    return;
  }

  raceStarted = true;
  finishOrder = [];
  particles = [];
  raceStartTime = Date.now(); // Guardar tiempo de inicio

  document.getElementById('start-btn').disabled = true;
  document.getElementById('start-btn').textContent = '🏁 CARRERA EN CURSO...';

  // Soltar todas las gotas AL MISMO TIEMPO
  var shuffled = [...participantes].sort(() => Math.random() - 0.5);

  // Calcular posiciones X distribuidas equitativamente
  var startX = 100;
  var endX = width - 100;
  var spacing = (endX - startX) / Math.max(shuffled.length - 1, 1);

  for (var i = 0; i < shuffled.length; i++) {
    // Posición X distribuida + pequeña variación aleatoria
    var x = startX + (i * spacing) + (Math.random() * 20 - 10);
    var p = new Particle(x, 20, 20, shuffled[i].nombre, false);  // Gotas grandes
    particles.push(p);
  }

  // Timeout de seguridad: forzar fin de carrera después de 10 segundos
  raceTimeout = setTimeout(function () {
    if (raceStarted && !raceEnded) {
      console.log('Timeout de carrera - forzando fin');
      forceFinishRemainingParticles();
      endRace();
    }
  }, 10000);
}

// Variable para timeout
var raceTimeout = null;
var raceStartTime = 0;

// Forzar que las partículas restantes lleguen
function forceFinishRemainingParticles() {
  for (var i = 0; i < particles.length; i++) {
    if (!particles[i].finished) {
      particles[i].finished = true;
      finishOrder.push(particles[i].nombre);
    }
  }
  updateLeaderboard();
}

function handleCollision(event) {
  // Las colisiones ahora solo se usan para física, no para detectar ganadores
  // La detección de llegada se hace en draw() por posición Y
}

// Detectar llegada a la meta por posición Y (más preciso que colisiones)
function checkFinishLine() {
  var finishY = height - 70; // Línea de meta

  for (var i = 0; i < particles.length; i++) {
    if (!particles[i].finished && particles[i].body.position.y >= finishY) {
      particles[i].finished = true;
      finishOrder.push(particles[i].nombre);
      updateLeaderboard();

      console.log('Llegó a meta:', particles[i].nombre, 'Posición:', finishOrder.length);

      // ¡El PRIMERO en llegar es el ganador! - termina la carrera inmediatamente
      if (finishOrder.length === 1) {
        endRace();
      }
    }
  }
}

function updateLeaderboard() {
  var html = '';
  var medals = ['🥇', '🥈', '🥉'];

  for (var i = 0; i < Math.min(finishOrder.length, 10); i++) {
    var medal = medals[i] || (i + 1) + '.';
    var isWinner = i === 0 && raceEnded;
    var nombre = getShortName(finishOrder[i]);

    html += '<div class="leaderboard-item' + (isWinner ? ' winner' : '') + '">';
    html += '<span class="medal">' + medal + '</span>';
    html += '<span>' + nombre + '</span>';
    html += '</div>';
  }

  document.getElementById('leaderboard-list').innerHTML = html;
}

function getShortName(fullName) {
  var parts = fullName.split(' ');
  if (parts.length >= 2) {
    return parts[0] + ' ' + parts[1].charAt(0) + '.';
  }
  return parts[0];
}

function endRace() {
  if (raceEnded) return;
  raceEnded = true;
  winner = finishOrder[0];

  document.getElementById('start-btn').textContent = '✓ CARRERA FINALIZADA';
  document.getElementById('reset-btn').style.display = 'inline-block';

  // Registrar ganador en el backend
  var premioId = document.getElementById('prize-select').value;
  if (premioId && winner) {
    fetch('/api/sortear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        premio_id: parseInt(premioId),
        ganador_nombre: winner  // El ganador real de la carrera
      })
    }).catch(err => console.error('Error registrando ganador:', err));
  }

  // Mostrar modal del ganador después de 2 segundos
  console.log('Carrera terminada, mostrando modal en 2 segundos...');
  console.log('Ganador:', winner, 'Premio:', premioActual);

  setTimeout(function () {
    console.log('Mostrando modal ahora');

    // Mostrar nombre del ganador
    var firstName = document.getElementById('first-name');
    if (firstName) {
      firstName.textContent = finishOrder[0] || winner || '-';
    }

    // Mostrar nombre del premio
    var prizeEl = document.getElementById('winner-prize');
    if (prizeEl) {
      prizeEl.textContent = '🎁 ' + premioActual;
    }

    // Mostrar imagen del premio si existe
    var prizeImage = document.getElementById('winner-prize-image');
    if (prizeImage) {
      if (premioImagenActual && premioImagenActual.length > 0) {
        prizeImage.src = premioImagenActual;
        prizeImage.style.display = 'block';
      } else {
        prizeImage.style.display = 'none';
      }
    }

    // Mostrar el modal
    var modal = document.getElementById('winner-modal');
    if (modal) {
      modal.classList.add('active');
      console.log('Modal activado');
    } else {
      console.error('Modal no encontrado!');
    }
  }, 2000);
}

function resetRace() {
  // Limpiar timeout si existe
  if (raceTimeout) {
    clearTimeout(raceTimeout);
    raceTimeout = null;
  }

  // Limpiar partículas
  for (var i = 0; i < particles.length; i++) {
    World.remove(world, particles[i].body);
  }
  particles = [];
  finishOrder = [];
  raceStarted = false;
  raceEnded = false;
  winner = null;
  ganadorForzado = null;

  document.getElementById('start-btn').disabled = false;
  document.getElementById('start-btn').textContent = '💧 INICIAR CARRERA';
  document.getElementById('reset-btn').style.display = 'none';
  document.getElementById('leaderboard-list').innerHTML = '';
  document.getElementById('winner-modal').classList.remove('active');

  loadData();
}

function draw() {
  // Fondo degradado azul oscuro
  drawBackground();

  // Actualizar física
  Engine.update(engine, 1000 / 60);

  // Dibujar obstáculos Plinko
  for (var i = 0; i < plinkos.length; i++) {
    plinkos[i].show();
  }

  // Dibujar límites (solo los slots visibles)
  for (var i = 0; i < bounds.length; i++) {
    bounds[i].show();
  }

  // Dibujar partículas
  for (var i = particles.length - 1; i >= 0; i--) {
    particles[i].show();

    // Empujar partículas lentas después de 5 segundos
    if (raceStarted && !raceEnded && !particles[i].finished) {
      var elapsedTime = Date.now() - raceStartTime;
      if (elapsedTime > 5000) {
        var vel = particles[i].body.velocity;
        var speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);

        // Si la partícula va muy lenta, empujarla
        if (speed < 0.5) {
          Matter.Body.applyForce(particles[i].body, particles[i].body.position, {
            x: (Math.random() - 0.5) * 0.001,
            y: 0.002
          });
        }
      }
    }
  }

  // Verificar llegada a la meta
  if (raceStarted && !raceEnded) {
    checkFinishLine();
  }

  // Línea de meta
  drawFinishLine();
}

function drawBackground() {
  // Degradado oscuro
  for (var y = 0; y < height; y++) {
    var ratio = y / height;
    var c = lerpColor(color(210, 60, 15), color(210, 70, 8), ratio);
    stroke(c);
    line(0, y, width, y);
  }

  // Grid sutil
  stroke(210, 50, 20);
  strokeWeight(1);
  for (var x = 0; x < width; x += 40) {
    line(x, 0, x, height);
  }
  for (var y = 0; y < height; y += 40) {
    line(0, y, width, y);
  }
}

function drawFinishLine() {
  // Patrón de cuadros de meta (sincronizado con detección en height-70)
  var y = height - 70;
  var tileSize = 20;
  var numTiles = Math.ceil(width / tileSize);

  for (var i = 0; i < numTiles; i++) {
    fill(i % 2 === 0 ? 255 : 0);
    noStroke();
    rect(i * tileSize, y, tileSize, 10);
  }

  // Texto META
  fill(gold);
  textAlign(CENTER, CENTER);
  textSize(16);
  textStyle(BOLD);
  text('🏁 META', width / 2, y + 25);
}

// Event listeners
document.getElementById('start-btn').addEventListener('click', startRace);
document.getElementById('reset-btn').addEventListener('click', resetRace);
document.getElementById('close-modal-btn').addEventListener('click', function () {
  document.getElementById('winner-modal').classList.remove('active');
});
