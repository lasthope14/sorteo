// Hidroobras Admin Panel Script

// Tab Navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active from all tabs
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        // Activate clicked tab
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab + '-tab').classList.add('active');

        // Reload data when switching to admin
        if (btn.dataset.tab === 'admin') {
            loadAdminData();
        }
    });
});

// Load Admin Data
async function loadAdminData() {
    try {
        // Load participants
        const partRes = await fetch('/api/participantes');
        const participants = await partRes.json();
        renderParticipantsList(participants);

        // Load all prizes (including raffled)
        const prizesRes = await fetch('/api/premios');
        const prizes = await prizesRes.json();
        renderPrizesList(prizes);

        // Load winners
        const winnersRes = await fetch('/api/ganadores');
        const winners = await winnersRes.json();
        renderWinnersList(winners);

    } catch (error) {
        console.error('Error cargando datos admin:', error);
    }
}

function renderParticipantsList(participants) {
    const list = document.getElementById('participants-list');
    if (participants.length === 0) {
        list.innerHTML = '<div style="text-align: center; padding: 1rem; color: rgba(255,255,255,0.5);">No hay participantes</div>';
        return;
    }

    list.innerHTML = participants.map(p => `
    <div class="admin-list-item">
      <span>${p.nombre} ${p.activo ? '' : '(inactivo)'}</span>
      <button class="delete-btn" onclick="deleteParticipant(${p.id})">🗑️</button>
    </div>
  `).join('');
}

function renderPrizesList(prizes) {
    const list = document.getElementById('prizes-list');
    if (prizes.length === 0) {
        list.innerHTML = '<div style="text-align: center; padding: 1rem; color: rgba(255,255,255,0.5);">No hay premios</div>';
        return;
    }

    list.innerHTML = prizes.map(p => `
    <div class="admin-list-item" style="display: flex; align-items: center; gap: 0.5rem;">
      ${p.imagen ? `<img src="${p.imagen}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px;">` : '<span style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: rgba(79,195,247,0.2); border-radius: 6px;">🎁</span>'}
      <span style="flex: 1;">${p.nombre} ${p.sorteado ? '✅' : ''}</span>
      <button class="delete-btn" onclick="deletePrize(${p.id})">🗑️</button>
    </div>
  `).join('');
}

function renderWinnersList(winners) {
    const list = document.getElementById('winners-list');
    if (winners.length === 0) {
        list.innerHTML = '<div style="text-align: center; padding: 1rem; color: rgba(255,255,255,0.5);">No hay ganadores aún</div>';
        return;
    }

    list.innerHTML = winners.map(w => `
    <div class="admin-list-item">
      <span>🏆 ${w.nombre_participante} - ${w.nombre_premio}</span>
    </div>
  `).join('');
}

// Add Participants
document.getElementById('add-participants-btn').addEventListener('click', async () => {
    const input = document.getElementById('participants-input');
    const names = input.value.split('\n').map(n => n.trim()).filter(n => n);

    if (names.length === 0) {
        alert('Por favor ingresa al menos un nombre');
        return;
    }

    try {
        const res = await fetch('/api/participantes/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombres: names })
        });

        const data = await res.json();
        alert(`${data.insertados} participantes agregados`);
        input.value = '';
        loadAdminData();

    } catch (error) {
        console.error('Error agregando participantes:', error);
        alert('Error al agregar participantes');
    }
});

// Clear All Participants
document.getElementById('clear-participants-btn').addEventListener('click', async () => {
    if (!confirm('¿Estás seguro de eliminar TODOS los participantes?')) return;

    try {
        await fetch('/api/participantes', { method: 'DELETE' });
        loadAdminData();
    } catch (error) {
        console.error('Error:', error);
    }
});

// Delete Single Participant
async function deleteParticipant(id) {
    try {
        await fetch(`/api/participantes/${id}`, { method: 'DELETE' });
        loadAdminData();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Image Preview
document.getElementById('prize-image-input').addEventListener('change', function (e) {
    const file = e.target.files[0];
    const preview = document.getElementById('prize-image-preview');
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            preview.src = event.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'none';
    }
});

// Add Prize (with image)
document.getElementById('add-prize-btn').addEventListener('click', async () => {
    const name = document.getElementById('prize-name-input').value.trim();
    const desc = document.getElementById('prize-desc-input').value.trim();
    const imageInput = document.getElementById('prize-image-input');
    const imageFile = imageInput.files[0];

    if (!name) {
        alert('El nombre del premio es requerido');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('nombre', name);
        formData.append('descripcion', desc);
        if (imageFile) {
            formData.append('imagen', imageFile);
        }

        await fetch('/api/premios', {
            method: 'POST',
            body: formData
        });

        document.getElementById('prize-name-input').value = '';
        document.getElementById('prize-desc-input').value = '';
        document.getElementById('prize-image-input').value = '';
        document.getElementById('prize-image-preview').style.display = 'none';
        loadAdminData();

    } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar premio');
    }
});

// Delete Prize
async function deletePrize(id) {
    try {
        await fetch(`/api/premios/${id}`, { method: 'DELETE' });
        loadAdminData();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Clear All Prizes
document.getElementById('clear-prizes-btn').addEventListener('click', async () => {
    if (!confirm('¿Estás seguro de eliminar TODOS los premios?')) return;

    try {
        await fetch('/api/premios', { method: 'DELETE' });
        loadAdminData();
    } catch (error) {
        console.error('Error:', error);
    }
});

// Reset Raffle
document.getElementById('reset-raffle-btn').addEventListener('click', async () => {
    if (!confirm('¿Reiniciar el sorteo? Esto reactivará todos los participantes y premios.')) return;

    try {
        await fetch('/api/reiniciar', { method: 'POST' });
        alert('Sorteo reiniciado');
        loadAdminData();
    } catch (error) {
        console.error('Error:', error);
    }
});
