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
        console.log("Respuesta del servidor:", data);
        
        if(data.planta) {
            const nombrePlanta = data.planta;
            const nombreFormateado = nombrePlanta.replace(/_/g, ' ');
            
            // Crear elemento de imagen dinámicamente
            const img = document.createElement('img');
            img.alt = nombreFormateado;
            img.className = 'imagen-planta';
            
            // Intentar diferentes formatos de imagen
            const formatos = ['webp', 'jpg', 'png'];
            let imgIndex = 0;
            
            const tryNextFormat = () => {
                if (imgIndex >= formatos.length) {
                    img.style.display = 'none'; // Ocultar si no se encuentra ninguna imagen
                    return;
                }
                
                img.src = `img/${nombrePlanta.toLowerCase()}.${formatos[imgIndex]}`;
                imgIndex++;
                
                img.onerror = tryNextFormat;
            };
            
            tryNextFormat();
            
            // Construir el HTML finalC:\Users\baruj\OneDrive\Desktop\8 semestre\sistemas\proyecto\script.js
            mensajeDiv.innerHTML = `
                <h2>Planta recomendada:</h2>
                <div class="planta-recomendada">
                    <h3>${nombreFormateado}</h3>
                </div>`;
            
            // Añadir la imagen al DOM
            document.querySelector('.planta-recomendada').appendChild(img);
        } else {
            throw new Error('No se encontraron plantas que coincidan');
        }
    })
    .catch(error => {
        console.error('Error en la solicitud:', error);
        mensajeDiv.innerHTML = `
            <p>No se encontraron plantas que coincidan con tus criterios.</p>
            <p class="error-detalle">${error.message}</p>`;
    });
});