/**
 * Live System Notifications
 * Immersive world-building alerts for Cosmerium Era III
 */

const NOTIFICATION_MESSAGES = [
    "[ALERTA] Despliegue del NCPD detectado en Northside. Eviten la zona.",
    "[INFO] Convoy de Militech escoltando cargamento 'clase-S' hacia las afueras.",
    "[RUMOR] Los Netrunners de la Red Libre informan de un pico de tráfico en el subnivel 4.",
    "[SISTEMA] Escaneo de red finalizado: No se detectan brechas activas en el nodo local.",
    "[EVENTO] El Afterlife anuncia 'Happy Hour' para Mercs de nivel 5 o superior.",
    "[ALERTA] Trauma Team en camino hacia Japantown. Nivel de suscripción: Platinum.",
    "[INFO] Nueva oferta de implantes en la clínica de Viktor Vektor. ¡Solo esta semana!",
    "[SISTEMA] Actualización de firmware del Cyberdeck completada satisfactoriamente.",
    "[RUMOR] Se busca mercenario para 'curro' de alto riesgo en Arasaka Tower.",
    "[EVENTO] Carreras ilegales detectadas en el anillo exterior de las Badlands.",
    "[AVISO] Corte de suministro eléctrico programado en Pacifica por mantenimiento de red.",
    "[INFO] Los Tiger Claws han aumentado su presencia en Charter Hill.",
    "[ALERTA] Actividad inusual de ciberpsicópata reportada cerca de Wellsprings.",
    "[SISTEMA] Monitorizando comunicaciones corporativas... [DIFUSIÓN RESTRINGIDA]",
    "[RUMOR] Un nuevo cargamento de 'Braindance' ilegal ha llegado al mercado negro.",
    "[INFO] Kang Tao busca especialistas en seguridad para sus laboratorios de biotecnología.",
    "[AVISO] Bloqueo de carreteras en Santo Domingo por disturbios civiles.",
    "[EVENTO] Concierto de Samurai (Homenaje) en el Rainbow Cadenza esta noche.",
    "[SISTEMA] Nodo de enlace ICE actualizado. Estabilidad del sistema: 99.8%",
    "[RUMOR] Alguien está pagando bien por información sobre el proyecto 'Soulkiller'."
];

class LiveNotifications {
    constructor() {
        this.container = null;
        this.currentTimeout = null;
        this.init();
    }

    init() {
        // Inject Styles
        const style = document.createElement('style');
        style.textContent = `
            .cyber-notifications-hud {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 300px;
                z-index: 9999;
                font-family: 'Share Tech Mono', monospace;
                pointer-events: none;
            }
            .cyber-notif {
                background: rgba(4, 6, 10, 0.9);
                border-left: 3px solid #ff2a45;
                border-right: 1px solid rgba(255, 42, 69, 0.3);
                padding: 10px 15px;
                margin-top: 10px;
                color: #a8c4d8;
                font-size: 0.8rem;
                box-shadow: 0 0 15px rgba(0,0,0,0.5);
                transform: translateX(110%);
                transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                display: flex;
                flex-direction: column;
                gap: 5px;
                backdrop-filter: blur(5px);
            }
            .cyber-notif.active {
                transform: translateX(0);
            }
            .notif-header {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #ff2a45;
                font-size: 0.65rem;
                letter-spacing: 2px;
                text-transform: uppercase;
                font-weight: bold;
            }
            .notif-dot {
                width: 6px;
                height: 6px;
                background: #ff2a45;
                border-radius: 50%;
                box-shadow: 0 0 8px #ff2a45;
                animation: notif-blink 1s infinite;
            }
            .notif-content {
                line-height: 1.4;
                text-shadow: 0 0 2px rgba(168, 196, 216, 0.5);
            }
            @keyframes notif-blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
            }
            .glitch-text-notif {
                animation: glitch-anim-notif 0.3s steps(2) infinite;
            }
            @keyframes glitch-anim-notif {
                0% { transform: translate(1px, 0); }
                50% { transform: translate(-1px, 1px); color: #00e5ff; }
                100% { transform: translate(0, 0); }
            }
        `;
        document.head.appendChild(style);

        // Create Container
        this.container = document.createElement('div');
        this.container.className = 'cyber-notifications-hud';
        document.body.appendChild(this.container);

        // Start cycling
        this.startCycling();
    }

    showNotification() {
        let msg = NOTIFICATION_MESSAGES[Math.floor(Math.random() * NOTIFICATION_MESSAGES.length)];
        const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');

        // If on index, obfuscate the message to keep the mystery
        if (isIndex) {
            msg = msg.split('').map(char => {
                if (char === ' ' || char === '[' || char === ']') return char;
                return Math.random() > 0.7 ? char : Math.floor(Math.random() * 16).toString(16).toUpperCase();
            }).join('');
            msg = `[ENCRYPTED_STREAM] // ${msg.substring(0, 40)}...`;
        }

        const notif = document.createElement('div');
        notif.className = 'cyber-notif';
        notif.innerHTML = `
            <div class="notif-header">
                <div class="notif-dot"></div>
                <span>LIVE_FEED // NODE_${Math.floor(Math.random() * 900 + 100)}</span>
            </div>
            <div class="notif-content">${msg}</div>
        `;

        this.container.appendChild(notif);

        // Animate in
        setTimeout(() => {
            notif.classList.add('active');
            notif.classList.add('glitch-text-notif');
            setTimeout(() => notif.classList.remove('glitch-text-notif'), 400);
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            notif.classList.remove('active');
            setTimeout(() => {
                if (notif.parentNode) {
                    notif.parentNode.removeChild(notif);
                }
            }, 600);
        }, 8000); // Display per 8 seconds
    }

    startCycling() {
        // First one after a short delay
        setTimeout(() => this.showNotification(), 3000);

        // Every 20 seconds
        setInterval(() => {
            this.showNotification();
        }, 20000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new LiveNotifications());
} else {
    new LiveNotifications();
}
