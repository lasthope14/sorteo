import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import multer from 'multer';
import { existsSync, mkdirSync } from 'fs';
import db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear carpeta de uploads si no existe
const uploadsDir = join(__dirname, 'public', 'uploads');
if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
}

// Configurar multer para subir imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        cb(null, 'premio-' + uniqueSuffix + '.' + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes'));
        }
    }
});

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(join(__dirname, 'public')));

// Ruta principal - sirve el juego
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

// ============ PARTICIPANTES ============

// Obtener todos los participantes activos
app.get('/api/participantes', (req, res) => {
    try {
        const participantes = db.prepare('SELECT * FROM participantes WHERE activo = 1 ORDER BY nombre').all();
        res.json(participantes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Agregar participante
app.post('/api/participantes', (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }
        const result = db.prepare('INSERT INTO participantes (nombre) VALUES (?)').run(nombre.trim());
        res.json({ id: result.lastInsertRowid, nombre: nombre.trim(), activo: 1 });
    } catch (error) {
        if (error.message.includes('UNIQUE')) {
            res.status(400).json({ error: 'Este participante ya existe' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// Agregar múltiples participantes
app.post('/api/participantes/bulk', (req, res) => {
    try {
        const { nombres } = req.body;
        if (!nombres || !Array.isArray(nombres)) {
            return res.status(400).json({ error: 'Se requiere un array de nombres' });
        }

        const insertStmt = db.prepare('INSERT OR IGNORE INTO participantes (nombre) VALUES (?)');
        const insertMany = db.transaction((nombres) => {
            let count = 0;
            for (const nombre of nombres) {
                if (nombre && nombre.trim()) {
                    const result = insertStmt.run(nombre.trim());
                    if (result.changes > 0) count++;
                }
            }
            return count;
        });

        const insertados = insertMany(nombres);
        res.json({ mensaje: `${insertados} participantes agregados`, insertados });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar todos los participantes (DEBE IR ANTES de :id)
app.delete('/api/participantes', (req, res) => {
    try {
        // Primero eliminar referencias en ganadores
        db.prepare('DELETE FROM ganadores').run();
        db.prepare('DELETE FROM participantes').run();
        res.json({ mensaje: 'Todos los participantes eliminados' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar participante individual
app.delete('/api/participantes/:id', (req, res) => {
    try {
        const { id } = req.params;
        // Eliminar referencias en ganadores
        db.prepare('DELETE FROM ganadores WHERE participante_id = ?').run(id);
        db.prepare('DELETE FROM participantes WHERE id = ?').run(id);
        res.json({ mensaje: 'Participante eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ PREMIOS ============

// Obtener todos los premios
app.get('/api/premios', (req, res) => {
    try {
        const premios = db.prepare('SELECT * FROM premios ORDER BY sorteado, id').all();
        res.json(premios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener premios disponibles (no sorteados)
app.get('/api/premios/disponibles', (req, res) => {
    try {
        const premios = db.prepare('SELECT * FROM premios WHERE sorteado = 0 ORDER BY id').all();
        res.json(premios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Agregar premio (con o sin imagen)
app.post('/api/premios', upload.single('imagen'), (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre del premio es requerido' });
        }

        const imagenPath = req.file ? '/uploads/' + req.file.filename : null;

        const result = db.prepare('INSERT INTO premios (nombre, descripcion, imagen) VALUES (?, ?, ?)').run(
            nombre.trim(),
            descripcion || '',
            imagenPath
        );

        res.json({
            id: result.lastInsertRowid,
            nombre: nombre.trim(),
            descripcion: descripcion || '',
            imagen: imagenPath,
            sorteado: 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar todos los premios (DEBE IR ANTES de :id)
app.delete('/api/premios', (req, res) => {
    try {
        // Primero eliminar referencias en ganadores
        db.prepare('DELETE FROM ganadores').run();
        db.prepare('DELETE FROM premios').run();
        res.json({ mensaje: 'Todos los premios eliminados' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar premio individual
app.delete('/api/premios/:id', (req, res) => {
    try {
        const { id } = req.params;
        // Eliminar referencias en ganadores
        db.prepare('DELETE FROM ganadores WHERE premio_id = ?').run(id);
        db.prepare('DELETE FROM premios WHERE id = ?').run(id);
        res.json({ mensaje: 'Premio eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ SORTEO ============

// Realizar sorteo (acepta ganador de la carrera o elige aleatorio)
app.post('/api/sortear', (req, res) => {
    try {
        const { premio_id, ganador_nombre } = req.body;

        // Obtener premio
        const premio = db.prepare('SELECT * FROM premios WHERE id = ? AND sorteado = 0').get(premio_id);
        if (!premio) {
            return res.status(400).json({ error: 'Premio no válido o ya sorteado' });
        }

        let ganador;

        // Si se proporciona nombre del ganador (de la carrera), usarlo
        if (ganador_nombre) {
            ganador = db.prepare('SELECT * FROM participantes WHERE nombre = ? AND activo = 1').get(ganador_nombre);
            if (!ganador) {
                // Si no existe exactamente, buscar parcialmente
                ganador = db.prepare('SELECT * FROM participantes WHERE nombre LIKE ? AND activo = 1').get(`%${ganador_nombre}%`);
            }
        }

        // Si no hay ganador especificado, elegir aleatorio
        if (!ganador) {
            const participantes = db.prepare('SELECT * FROM participantes WHERE activo = 1').all();
            if (participantes.length === 0) {
                return res.status(400).json({ error: 'No hay participantes disponibles' });
            }
            const ganadorIndex = Math.floor(Math.random() * participantes.length);
            ganador = participantes[ganadorIndex];
        }

        // Registrar ganador
        db.prepare(`
      INSERT INTO ganadores (participante_id, premio_id, nombre_participante, nombre_premio)
      VALUES (?, ?, ?, ?)
    `).run(ganador.id, premio.id, ganador.nombre, premio.nombre);

        // Marcar participante como inactivo (ya ganó)
        db.prepare('UPDATE participantes SET activo = 0 WHERE id = ?').run(ganador.id);

        // Marcar premio como sorteado
        db.prepare('UPDATE premios SET sorteado = 1 WHERE id = ?').run(premio.id);

        res.json({
            ganador: ganador,
            premio: premio,
            mensaje: 'Ganador registrado exitosamente'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ GANADORES ============

// Obtener historial de ganadores
app.get('/api/ganadores', (req, res) => {
    try {
        const ganadores = db.prepare('SELECT * FROM ganadores ORDER BY fecha DESC').all();
        res.json(ganadores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reiniciar sorteo (para testing)
app.post('/api/reiniciar', (req, res) => {
    try {
        db.prepare('UPDATE participantes SET activo = 1').run();
        db.prepare('UPDATE premios SET sorteado = 0').run();
        db.prepare('DELETE FROM ganadores').run();
        res.json({ mensaje: 'Sorteo reiniciado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🎰 Servidor Gran Rifa Hidroobras corriendo en http://localhost:${PORT}`);
});
