import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'rifa.db'));

// Crear tablas
db.exec(`
  CREATE TABLE IF NOT EXISTS participantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS premios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    imagen TEXT,
    sorteado INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ganadores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participante_id INTEGER,
    premio_id INTEGER,
    nombre_participante TEXT,
    nombre_premio TEXT,
    imagen_premio TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participante_id) REFERENCES participantes(id),
    FOREIGN KEY (premio_id) REFERENCES premios(id)
  );
`);

// Insertar datos de ejemplo si no existen
const countParticipantes = db.prepare('SELECT COUNT(*) as count FROM participantes').get();
if (countParticipantes.count === 0) {
  const nombresEjemplo = [
    'Juan Carlos Pérez', 'María Fernanda García', 'Carlos Andrés López',
    'Ana María Rodríguez', 'Pedro Pablo Martínez', 'Laura Valentina Sánchez',
    'Diego Alejandro Torres', 'Sofía Isabella Ramírez', 'Andrés Felipe Vargas',
    'Camila Andrea Morales', 'Luis Miguel Herrera', 'Valentina Castro',
    'Santiago Gómez', 'Daniela Ospina', 'Julián Restrepo',
    'Natalia Mejía', 'Sebastián Cardona', 'Paula Andrea Ríos',
    'Alejandro Muñoz', 'Carolina Duque', 'Felipe Aristizábal',
    'Mariana Salazar', 'Nicolás Bedoya', 'Isabela Montoya',
    'David Escobar', 'Gabriela Henao', 'Mateo Valencia',
    'Luciana Arango', 'Tomás Londoño', 'Valeria Zapata',
    'Roberto Jiménez', 'Patricia Moreno', 'Fernando Ruiz',
    'Claudia Ortiz', 'Jorge Mendoza', 'Andrea Vargas',
    'Ricardo Peña', 'Mónica Soto', 'Eduardo Silva',
    'Sandra Guerrero', 'Oscar Medina', 'Diana Rojas',
    'Gustavo Paredes', 'Liliana Torres', 'Héctor Navarro',
    'Martha Campos', 'Raúl Flores', 'Gloria Vega',
    'Iván Córdoba', 'Lucía Mendez'
  ];

  const insertParticipante = db.prepare('INSERT INTO participantes (nombre) VALUES (?)');
  nombresEjemplo.forEach(nombre => {
    try {
      insertParticipante.run(nombre);
    } catch (e) {
      // Ignorar duplicados
    }
  });
  console.log('✅ 50 Participantes de ejemplo agregados');
}

const countPremios = db.prepare('SELECT COUNT(*) as count FROM premios').get();
if (countPremios.count === 0) {
  const premiosEjemplo = [
    { nombre: 'Televisor 55"', descripcion: 'Smart TV 4K Samsung' },
    { nombre: 'Bono $500.000', descripcion: 'Bono en efectivo' },
    { nombre: 'Licuadora Ninja', descripcion: 'Licuadora profesional' },
    { nombre: 'Audífonos Bluetooth', descripcion: 'Sony WH-1000XM4' },
    { nombre: 'Día Libre', descripcion: 'Un día libre con goce de sueldo' }
  ];

  const insertPremio = db.prepare('INSERT INTO premios (nombre, descripcion) VALUES (?, ?)');
  premiosEjemplo.forEach(premio => {
    insertPremio.run(premio.nombre, premio.descripcion);
  });
  console.log('✅ Premios de ejemplo agregados');
}

// Migración: añadir columna imagen si no existe
try {
  db.exec('ALTER TABLE premios ADD COLUMN imagen TEXT');
  console.log('✅ Columna imagen añadida a premios');
} catch (e) {
  // La columna ya existe, ignorar
}

try {
  db.exec('ALTER TABLE ganadores ADD COLUMN imagen_premio TEXT');
  console.log('✅ Columna imagen_premio añadida a ganadores');
} catch (e) {
  // La columna ya existe, ignorar
}

export default db;
