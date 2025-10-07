
/*
 * Este archivo contiene toda la lógica de interacción de la página.
 * Responsabilidad: COMPORTAMIENTO (JavaScript, Canvas API).
 */

// El script se ejecuta cuando todo el contenido, incluyendo estilos, está cargado,
// garantizando que los elementos del DOM (como el canvas) existen.
window.onload = () => {
    // Referencias a elementos del DOM
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const canvas = document.getElementById('interactive-bg');
    
    // Si el canvas no existe o no tiene contexto 2D, el script se detiene
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = 75; // Número de partículas en el fondo

    // --- 1. Lógica para el Menú Móvil (Toggle) - Interacción Responsiva ---
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden'); // Oculta/muestra el menú
        const icon = menuBtn.querySelector('i');
        
        // Cambia el icono de hamburguesa a X y viceversa
        if (mobileMenu.classList.contains('hidden')) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        } else {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        }
    });

    // --- 2. Lógica del Fondo Interactivo (Canvas API) ---

    // Función para redimensionar el canvas al tamaño de la sección hero
    function resizeCanvas() {
        // Establece el tamaño del canvas para que coincida con la sección padre
        const section = canvas.parentElement;
        width = canvas.width = section.clientWidth;
        height = canvas.height = section.clientHeight;
        
        // Solo inicializa las partículas si el tamaño es válido (mayor robustez)
        if (width > 0 && height > 0) {
            particles = []; // Reinicia las partículas al redimensionar
            initParticles();
        } else {
             // Intenta redimensionar de nuevo si el tamaño es 0
             setTimeout(resizeCanvas, 50);
        }
    }

    // Inicializa la lista de partículas
    function initParticles() {
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    // Clase que define una partícula individual
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 1; // Tamaño entre 1px y 3px
            this.speedX = Math.random() * 1 - 0.5; // Velocidad X (-0.5 a 0.5)
            this.speedY = Math.random() * 1 - 0.5; // Velocidad Y (-0.5 a 0.5)
            this.color = 'rgba(255, 255, 255, 0.8)'; 
        }
        
        // Actualiza la posición de la partícula
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Invierte la dirección si choca con los límites del canvas
            if (this.x > width || this.x < 0) this.speedX *= -1;
            if (this.y > height || this.y < 0) this.speedY *= -1;
        }
        
        // Dibuja la partícula
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Dibuja líneas entre partículas cercanas
    function connect() {
        let opacityValue;
        if (width === 0 || height === 0) return; 

        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                // Calcula la distancia al cuadrado (para rendimiento)
                const distanceSq = ((particles[a].x - particles[b].x) ** 2) + ((particles[a].y - particles[b].y) ** 2);
                
                // Radio de conexión
                const connectionRadiusSq = (width / 7) * (height / 7); 

                if (distanceSq < connectionRadiusSq) { 
                    opacityValue = 1 - (distanceSq / connectionRadiusSq); 
                    
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue * 0.5})`; 
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Bucle principal de la animación usando requestAnimationFrame
    function animate() {
        // Limpia el canvas con un color de fondo semi-transparente para crear un efecto de "rastro" sutil
        ctx.fillStyle = 'rgba(10, 10, 30, 0.1)'; 
        ctx.fillRect(0, 0, width, height); 
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        connect();
        requestAnimationFrame(animate);
    }

    // --- Inicialización y Event Listeners ---
    resizeCanvas(); // Asegura el tamaño y la inicialización de partículas
    
    window.addEventListener('resize', resizeCanvas); // Escucha cambios de tamaño de ventana
    
    // Inicia el bucle de animación
    animate();
};