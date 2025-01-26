// Configuración del canvas II
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Panel de información (ancho fijo)
const PANEL_WIDTH = 240; // 200px + 20px padding a cada lado
const PANEL_MARGIN = 20;

// Función para ajustar el tamaño del canvas
function ajustarTamañoCanvas() {
    // Calcular el espacio disponible
    const espacioDisponible = window.innerWidth - PANEL_WIDTH - (PANEL_MARGIN * 2);
    const alturaDisponible = window.innerHeight - (PANEL_MARGIN * 2);

    // Ajustar el canvas manteniendo proporción 4:3
    const proporcion = 4/3;
    let nuevoAncho = espacioDisponible;
    let nuevoAlto = espacioDisponible / proporcion;

    // Si la altura es mayor que la disponible, ajustar basado en altura
    if (nuevoAlto > alturaDisponible) {
        nuevoAlto = alturaDisponible;
        nuevoAncho = alturaDisponible * proporcion;
    }

    // Aplicar los nuevos tamaños
    canvas.style.width = `${nuevoAncho}px`;
    canvas.style.height = `${nuevoAlto}px`;
    canvas.width = 800; // Mantener resolución interna
    canvas.height = 600;

    // Posicionar el canvas
    canvas.style.position = 'fixed';
    canvas.style.left = `${PANEL_WIDTH + PANEL_MARGIN}px`;
    canvas.style.top = '50%';
    canvas.style.transform = 'translateY(-50%)';
}

// Ajustar el panel de información
const infoPanel = document.createElement('div');
infoPanel.style.cssText = `
    position: fixed;
    top: 50%;
    left: ${PANEL_MARGIN}px;
    transform: translateY(-50%);
    width: ${PANEL_WIDTH - (PANEL_MARGIN * 2)}px;
    padding: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    font-family: Arial, sans-serif;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
    z-index: 1000;
`;
document.body.appendChild(infoPanel);

// Evento de redimensionamiento
window.addEventListener('resize', ajustarTamañoCanvas);

// Llamar a la función de ajuste inicial
ajustarTamañoCanvas();

// Cargar imágenes
const imagenPolicia = new Image();
const imagenZombi = new Image();
imagenPolicia.src = 'img/policia_realista.png';
imagenZombi.src = 'img/zombi_realista.png';

// Variables globales
let nivel = 1;
let zombisMuertos = 0;
let juegoEnPausa = false;

// Función para actualizar la información
function actualizarInfoPanel() {
    infoPanel.innerHTML = `
        <button id="pausaBoton" style="
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            background: ${juegoEnPausa ? '#f44336' : '#2196F3'};
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            transition: background 0.3s;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        ">
            ${juegoEnPausa ? '▶️ Continuar' : '⏸️ Pausa'}
        </button>
        <div style="
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 15px;
        ">
            <h3 style="margin: 0 0 10px 0; color: #2196F3; text-align: center;">
                ESTADÍSTICAS
            </h3>
            <p style="margin: 5px 0; font-size: 16px;">🏆 Nivel: ${nivel}</p>
            <p style="margin: 5px 0; font-size: 16px;">💰 Monedas: ${jugador.monedas}</p>
            <p style="margin: 5px 0; font-size: 16px;">💀 Zombis: ${zombisMuertos}/10</p>
            <p style="margin: 5px 0; font-size: 16px;">🎯 Disparos: ${2 + nivel}</p>
        </div>
        ${nivel >= 3 ? `
            <div style="
                background: #f44336;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
                text-align: center;
                font-weight: bold;
            ">
                ⚠️ ¡CUIDADO!<br>
                Zombis Grandes
            </div>
        ` : ''}
        <div style="
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 5px;
            font-size: 14px;
        ">
            <h4 style="margin: 0 0 10px 0; color: #2196F3; text-align: center;">
                CONTROLES
            </h4>
            <p style="margin: 5px 0;">↑↓←→ Mover</p>
            <p style="margin: 5px 0;">A - Disparar</p>
            <p style="margin: 5px 0;">P - Pausar</p>
        </div>
    `;

    // Reconfigurar el botón de pausa
    document.getElementById('pausaBoton').onclick = () => {
        togglePausa();
    };
}

// Nueva función para manejar la pausa
function togglePausa() {
    juegoEnPausa = !juegoEnPausa;
    actualizarInfoPanel();
}

// Evento de tecla P para pausar
document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        togglePausa();
    }
});

// Clase Jugador
class Jugador {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.ancho = 32;
        this.alto = 32;
        this.velocidad = 5;
        this.direccion = 'derecha';
        this.monedas = 0;
    }

    dibujar() {
        ctx.save();
        if (this.direccion === 'izquierda') {
            ctx.scale(-1, 1);
            ctx.drawImage(imagenPolicia, -this.x - this.ancho, this.y, this.ancho, this.alto);
        } else {
            ctx.drawImage(imagenPolicia, this.x, this.y, this.ancho, this.alto);
        }
        ctx.restore();
    }

    mover(teclas) {
        if (teclas.ArrowLeft) {
            this.x -= this.velocidad;
            this.direccion = 'izquierda';
        }
        if (teclas.ArrowRight) {
            this.x += this.velocidad;
            this.direccion = 'derecha';
        }
        if (teclas.ArrowUp) this.y -= this.velocidad;
        if (teclas.ArrowDown) this.y += this.velocidad;

        // Traspaso de límites
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }
}

// Clase Bala
class Bala {
    constructor(x, y, direccion) {
        this.x = x;
        this.y = y;
        this.velocidad = 7;
        this.direccion = direccion;
        this.ancho = 10;
        this.alto = 5;
    }

    dibujar() {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.ancho, this.alto);
    }

    mover() {
        if (this.direccion === 'derecha') {
            this.x += this.velocidad;
        } else {
            this.x -= this.velocidad;
        }
    }
}

// Clase Zombi
class Zombi {
    constructor(esGrande = false) {
        this.esGrande = esGrande;
        this.ancho = esGrande ? 96 : 32;  // Triple tamaño si es grande
        this.alto = esGrande ? 96 : 32;
        this.x = Math.random() * (canvas.width - this.ancho);
        this.y = Math.random() * (canvas.height - this.alto);
        this.velocidad = esGrande ? 1.5 : 2;  // Más lento si es grande
        this.vida = esGrande ? (4 + nivel) : (2 + nivel);  // Más vida si es grande
        this.direccion = 'derecha';
        
        while (this.distanciaAlJugador() < 200) {
            this.x = Math.random() * (canvas.width - this.ancho);
            this.y = Math.random() * (canvas.height - this.alto);
        }
    }

    distanciaAlJugador() {
        const dx = (this.x + this.ancho/2) - (jugador.x + jugador.ancho/2);
        const dy = (this.y + this.alto/2) - (jugador.y + jugador.alto/2);
        return Math.sqrt(dx * dx + dy * dy);
    }

    dibujar() {
        // Dibujar el zombi
        ctx.save();
        if (this.direccion === 'izquierda') {
            ctx.scale(-1, 1);
            ctx.drawImage(imagenZombi, -this.x - this.ancho, this.y, this.ancho, this.alto);
        } else {
            ctx.drawImage(imagenZombi, this.x, this.y, this.ancho, this.alto);
        }
        ctx.restore();
        
        // Barra de vida
        const vidaMaxima = this.esGrande ? (4 + nivel) : (2 + nivel);
        const anchoBarraVida = this.ancho;
        const altoBarraVida = this.esGrande ? 10 : 5;
        
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y - (this.esGrande ? 20 : 10), anchoBarraVida, altoBarraVida);
        
        ctx.fillStyle = 'green';
        const vidaActual = (this.vida / vidaMaxima) * anchoBarraVida;
        ctx.fillRect(this.x, this.y - (this.esGrande ? 20 : 10), vidaActual, altoBarraVida);
        
        ctx.strokeStyle = 'black';
        ctx.lineWidth = this.esGrande ? 2 : 1;
        ctx.strokeRect(this.x, this.y - (this.esGrande ? 20 : 10), anchoBarraVida, altoBarraVida);
    }

    mover(jugadorX, jugadorY) {
        const dx = jugadorX - (this.x + this.ancho/2);
        const dy = jugadorY - (this.y + this.alto/2);
        const distancia = Math.sqrt(dx * dx + dy * dy);
        
        if (distancia > 0) {
            this.x += (dx / distancia) * this.velocidad;
            this.y += (dy / distancia) * this.velocidad;
            this.direccion = dx > 0 ? 'derecha' : 'izquierda';
        }
    }
}

// Variables del juego
const jugador = new Jugador();
let zombis = [new Zombi(false)];
let balas = [];
let teclas = {};
let juegoActivo = true;
let ultimoDisparo = 0;

// Control de teclas
document.addEventListener('keydown', (e) => {
    teclas[e.key] = true;
    e.preventDefault();
});

document.addEventListener('keyup', (e) => {
    teclas[e.key] = false;
});

// Función de colisión
function colision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.ancho &&
           obj1.x + obj1.ancho > obj2.x &&
           obj1.y < obj2.y + obj2.alto &&
           obj1.y + obj1.alto > obj2.y;
}

// Función para crear nuevo zombi
function crearNuevoZombi() {
    // A partir del nivel 3, 30% de probabilidad de zombi grande
    const debeSerGrande = nivel >= 3 && Math.random() < 0.3;
    return new Zombi(debeSerGrande);
}

// Función principal del juego
function actualizar() {
    if (!juegoActivo) {
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.fillText('GAME OVER', canvas.width/2 - 100, canvas.height/2);
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        return;
    }

    if (juegoEnPausa) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.fillText('JUEGO EN PAUSA', canvas.width/2 - 150, canvas.height/2);
        requestAnimationFrame(actualizar);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Actualizar jugador
    jugador.mover(teclas);
    jugador.dibujar();

    // Disparar
    const ahora = Date.now();
    if (teclas.a && ahora - ultimoDisparo > 250) {
        balas.push(new Bala(
            jugador.x + jugador.ancho/2,
            jugador.y + jugador.alto/2,
            jugador.direccion
        ));
        ultimoDisparo = ahora;
    }

    // Actualizar balas
    balas = balas.filter(bala => {
        bala.mover();
        bala.dibujar();
        return bala.x > 0 && bala.x < canvas.width;
    });

    // Actualizar zombis
    for (let i = zombis.length - 1; i >= 0; i--) {
        const zombi = zombis[i];
        zombi.mover(jugador.x, jugador.y);
        zombi.dibujar();

        for (let j = balas.length - 1; j >= 0; j--) {
            if (colision(balas[j], zombi)) {
                zombi.vida--;
                balas.splice(j, 1);
                if (zombi.vida <= 0) {
                    zombis.splice(i, 1);
                    jugador.monedas++;
                    zombisMuertos++;
                    
                    if (zombisMuertos >= 10) {
                        nivel++;
                        zombisMuertos = 0;
                    }
                    
                    zombis.push(crearNuevoZombi());
                    break;
                }
            }
        }

        if (colision(jugador, zombi)) {
            juegoActivo = false;
        }
    }

    // Actualizar panel de información
    actualizarInfoPanel();

    requestAnimationFrame(actualizar);
}

// Iniciar el juego
actualizar();

// Añadir estilos al body para evitar scroll
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.style.backgroundColor = '#1a1a1a'; // Fondo oscuro para el espacio no utilizado