document.getElementById("plantaForm").addEventListener("submit", function(event){
    event.preventDefault();

    const mensajeDiv = document.querySelector('.mensaje');
 
    mensajeDiv.innerHTML = '<p>Buscando plantas recomendadas...</p>';
    
    // Obtener valores del formulario de forma segura
    const formValues = {
        luz: document.querySelector('input[name="luz"]:checked')?.value,
        humedad: document.querySelector('input[name="humedad"]:checked')?.value,
        cuidado: document.querySelector('input[name="cuidado"]:checked')?.value,
        espacio: document.querySelector('input[name="espacio"]:checked')?.value,
        mascota: document.querySelector('input[name="mascota"]:checked')?.value
    };
    
    // Verificar que todos los campos estén completos
    if (!formValues.luz || !formValues.humedad || !formValues.cuidado || !formValues.espacio || !formValues.mascota) {
        mensajeDiv.innerHTML = '<p>Por favor completa todos los campos del formulario.</p>';
        return;
    }

    // Solo hacemos una petición a /recomendar
    fetch('http://localhost:8080/recomendar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formValues)
    })

    .then(response => {
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
       console.log("Respuesta del servidor:", JSON.stringify(data, null, 2));

        
        if (data.plantas && data.plantas.length > 0) {
    mensajeDiv.innerHTML = `<h2>Plantas recomendadas:</h2>`;
    
    data.plantas.forEach(nombrePlanta => {
        const nombreFormateado = nombrePlanta.replace(/_/g, ' ');

        // Crear contenedor individual
        const contenedor = document.createElement('div');
        contenedor.className = 'planta-recomendada';

        // Crear título
        const titulo = document.createElement('h3');
        titulo.textContent = nombreFormateado;

        // Crear imagen
        const img = document.createElement('img');
        img.alt = nombreFormateado;
        img.className = 'imagen-planta';

        const formatos = ['webp', 'jpg', 'png'];
        let imgIndex = 0;

        const tryNextFormat = () => {
            if (imgIndex >= formatos.length) {
                img.style.display = 'none';
                return;
            }
            img.src = `img/${nombrePlanta.toLowerCase()}.${formatos[imgIndex]}`;
            img.onerror = tryNextFormat;
            imgIndex++;
        };
        tryNextFormat();

        contenedor.appendChild(titulo);
        contenedor.appendChild(img);
        mensajeDiv.appendChild(contenedor);

        mostrarCaracteristicas(nombrePlanta, contenedor);
    });

    document.getElementById("plantaForm").reset();
    document.querySelectorAll('input[type="radio"]').forEach(input => input.checked = false);
}

    })
    .catch(error => {
        console.error('Error en la solicitud:', error);
        mensajeDiv.innerHTML = `
            <p>No se encontraron plantas que coincidan con tus criterios.</p>
            <p class="error-detalle">${error.message}</p>`;

             // Limpia el formulario también si ocurre un error (como no encontrar planta)
    document.getElementById("plantaForm").reset();
    document.querySelectorAll('input[type="radio"]').forEach(input => input.checked = false);
    });
  
});

 function mostrarCaracteristicas(nombrePlanta, contenedor) {
    fetch('http://localhost:8080/caracteristicas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planta: nombrePlanta })
    })
    .then(response => response.json())
    .then(data => {
        const caracteristicasHTML = `
            <div class="caracteristicas">
                <h4>Características:</h4>
                <p><strong>Nombre científico:</strong> ${data.nombreCientifico || 'No disponible'}</p>
                <p><strong>Riego:</strong> ${data.cantidadDeRiego} (${data.frecuenciaDeriego})</p>
                <p><strong>Espacio necesario:</strong> ${data.espacioDisponible}</p>
                <p><strong>Facilidad de cuidado:</strong> ${data.facilCuidado === 'si' ? 'Fácil' : 'Difícil'}</p>
                <p><strong>Segura para mascotas:</strong> ${data.seguraParaMascotas === 'si' ? 'Sí' : 'No'}</p>
                <p><strong>Tipo de luz:</strong> ${data.luz.replace(/_/g, ' ')}</p>
                <p><strong>Humedad requerida:</strong> ${data.humedad === 'si' ? 'Alta' : 'Baja'}</p>
                <p><strong>Temperatura ideal:</strong> ${data.temperatura.replace('_', ' ')}</p>
                <p><strong>Tipo de fertilizante:</strong> ${data.tipoFertilizante.replace(/_/g, ' ')}</p>
                <p><strong>Frecuencia de fertilización:</strong> ${data.frecuenciaFertilizacion.replace(/_/g, ' ')}</p>
                <p><strong>Cantidad de fertilización:</strong> ${data.cantidadFertilizante.replace(/_/g, ' ')}</p>
            </div>
        `;
        contenedor.insertAdjacentHTML('beforeend', caracteristicasHTML);
    })
    .catch(error => {
        console.error('Error al obtener características:', error);
    });
}


