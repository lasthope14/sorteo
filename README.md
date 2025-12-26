# 🔩 Carrera de Tuercas - Sorteo Hidroobras 2025

Juego interactivo de sorteo para eventos corporativos. Las tuercas (participantes) compiten en una carrera estilo Plinko y el primero en llegar gana el premio.

![Hidroobras](https://img.shields.io/badge/Hidroobras-2025-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎮 Características

- **Carrera de Tuercas**: Simulación física con Matter.js
- **Panel de Administración**: Gestión de participantes y premios
- **Imágenes de Premios**: Sube fotos para cada premio
- **Modal de Ganador**: Animación elegante al finalizar
- **Base de Datos SQLite**: Persistencia local de datos

## 🚀 Instalación

### Requisitos
- Node.js 18 o superior
- npm

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/lasthope14/sorteo.git
cd sorteo
```

2. **Instalar dependencias**
```bash
cd backend
npm install
```

3. **Iniciar el servidor**
```bash
npm start
```

4. **Abrir en el navegador**
```
http://localhost:3001
```

## 📖 Uso

### Pestaña CARRERA
1. Selecciona un premio del dropdown
2. Click en "💧 INICIAR CARRERA"
3. El primer participante en cruzar la meta gana

### Pestaña ADMINISTRACIÓN

**Participantes:**
- Ingresa nombres (uno por línea)
- Click "➕ Agregar Participantes"

**Premios:**
- Ingresa nombre y descripción
- Opcionalmente sube una imagen
- Click "➕ Agregar Premio"

**Historial:**
- Ver todos los ganadores anteriores
- Reiniciar el sorteo si es necesario

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript, p5.js
- **Física**: Matter.js
- **Backend**: Node.js, Express
- **Base de Datos**: SQLite (better-sqlite3)
- **Uploads**: Multer

## 📁 Estructura

```
sorteo/
├── backend/
│   ├── public/           # Frontend estático
│   │   ├── plinko/       # Juego de carreras
│   │   ├── uploads/      # Imágenes de premios
│   │   ├── index.html    # Página principal
│   │   └── admin.js      # Panel de admin
│   ├── server.js         # Servidor Express
│   ├── database.js       # Configuración SQLite
│   └── package.json
└── README.md
```

## 🎯 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/participantes | Listar participantes |
| POST | /api/participantes/bulk | Agregar múltiples |
| DELETE | /api/participantes | Eliminar todos |
| GET | /api/premios | Listar premios |
| POST | /api/premios | Agregar premio (con imagen) |
| DELETE | /api/premios | Eliminar todos |
| POST | /api/sortear | Registrar ganador |
| GET | /api/ganadores | Historial de ganadores |
| POST | /api/reiniciar | Reiniciar sorteo |

## 📝 Licencia

MIT License - Libre para uso personal y comercial.

---

Desarrollado para **Hidroobras** 🚰 2025
