// Lógica del Menú Hamburguesa
const hamburgerBtn = document.getElementById('hamburger-btn');
const navMenu = document.getElementById('nav-menu');
const overlay = document.getElementById('overlay');
const navLinks = document.querySelectorAll('.nav-links a');

const toggleMenu = () => {
    hamburgerBtn.classList.toggle('active');
    navMenu.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
};

hamburgerBtn.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);

// Cerrar menú al hacer clic en un enlace
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) toggleMenu();
    });
});

// Sistema de revelación con scroll
const observerOptions = { threshold: 0.15, rootMargin: '0px' };

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            entry.target.classList.remove('exit-up');
        } else {
            if (entry.boundingClientRect.top < 0) {
                entry.target.classList.add('exit-up');
            } else {
                entry.target.classList.remove('active');
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach((el, index) => {
    if (index % 2 === 0) {
        el.classList.add('from-left');
    } else {
        el.classList.add('from-right');
    }
    observer.observe(el);
});

// Lógica del Carrusel de Proyectos
const track = document.querySelector('.carousel-track');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');

let isTransitioning = false;

function moveNext() {
    if (isTransitioning) return;
    isTransitioning = true;

    const percentage = window.innerWidth <= 768 ? 100 : 33.33333;

    track.style.transition = ''; // Usar transición CSS
    track.style.transform = `translateX(-${percentage}%)`;

    track.addEventListener('transitionend', () => {
        track.appendChild(track.firstElementChild);
        track.style.transition = 'none';
        track.style.transform = 'translateX(0)';
        void track.offsetWidth; // Forzar reflow
        track.style.transition = '';
        isTransitioning = false;
    }, { once: true });
}

function movePrev() {
    if (isTransitioning) return;
    isTransitioning = true;

    const percentage = window.innerWidth <= 768 ? 100 : 33.33333;

    track.style.transition = 'none';
    track.prepend(track.lastElementChild);
    track.style.transform = `translateX(-${percentage}%)`;
    void track.offsetWidth;

    track.style.transition = '';
    track.style.transform = 'translateX(0)';

    track.addEventListener('transitionend', () => {
        isTransitioning = false;
    }, { once: true });
}

if (prevBtn) prevBtn.addEventListener('click', movePrev);
if (nextBtn) nextBtn.addEventListener('click', moveNext);

// Auto-play del carrusel (opcional)
if (document.querySelectorAll('.carousel-item').length > 0) {
    setInterval(moveNext, 5000);
}

// --- Lógica General de Modales ---

// Triggers que abren modales (tarjetas de pilares y la imagen de biografía)
const modalTriggers = document.querySelectorAll('[data-modal-target], #bio-trigger');

// Función para abrir un modal por su ID
const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
};

// Función para cerrar TODOS los modales abiertos
const closeModal = () => {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
};

// 1. Asignar eventos a los triggers para ABRIR el modal correspondiente
modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
        const modalId = trigger.dataset.modalTarget || 'bio-modal'; // Usa 'bio-modal' como fallback para la imagen
        openModal(modalId);
    });
});

// 2. Asignar eventos a TODOS los botones de cierre para CERRAR cualquier modal
document.querySelectorAll('.close-modal').forEach(button => button.addEventListener('click', closeModal));

// 3. Asignar evento a la ventana para CERRAR al hacer clic en el fondo del modal (overlay)
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) closeModal();
});

// Lógica para las tarjetas de distrito (Efecto burbuja WhatsApp)
document.querySelectorAll('.district-card').forEach(card => {
    card.addEventListener('click', () => {
        // Opcional: Cerrar otras burbujas al abrir una nueva
        document.querySelectorAll('.district-card').forEach(c => {
            if (c !== card) c.classList.remove('active-bubble');
        });
        card.classList.toggle('active-bubble');
    });

    card.addEventListener('mouseenter', () => {
        card.classList.add('active-bubble');
    });

    card.addEventListener('mouseleave', () => {
        card.classList.remove('active-bubble');
    });
});

// CONFIGURACIÓN CHATBOT GEMINI
const apiKey = ""; // Se inyecta automáticamente en el entorno
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const typingIndicator = document.getElementById('typing');
const chatWindow = document.getElementById('chat-window');
const chatBtn = document.getElementById('chat-button');
const chatClose = document.getElementById('chat-close');

function toggleChat() {
    chatWindow.classList.toggle('active');
    if (chatWindow.classList.contains('active')) chatInput.focus();
}

if (chatBtn) chatBtn.addEventListener('click', toggleChat);
if (chatClose) chatClose.addEventListener('click', toggleChat);

async function fetchGemini(prompt) {
    const systemPrompt = `Eres el asistente virtual oficial de Manuel Vivanco Osorio, candidato de Renovación Popular para la alcaldía de Huánuco 2026. 
            Tu objetivo es informar a los ciudadanos sobre su visión.
            Información Clave:
            - Lema: "Un solo equipo, un mismo destino".
            - Ejes del Plan: Agricultura y Productividad, Infraestructura, Educación y Salud, Medio Ambiente, Gobierno Transparente, Seguridad Ciudadana y Cero Corrupción.
            - Valor Principal: "Si tengo a Dios, lo tengo todo".
            Responde de manera amable, patriótica, profesional y concisa (máximo 3 líneas por respuesta). Siempre enfócate en el progreso de Huánuco.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    let retries = 5;
    let delay = 1000;

    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    systemInstruction: { parts: [{ text: systemPrompt }] }
                })
            });
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, tuve un problema al procesar tu duda. ¿Podrías repetirla?";
        } catch (error) {
            if (i === retries - 1) return "Lo sentimos, el servicio no está disponible en este momento. Inténtalo más tarde.";
            await new Promise(res => setTimeout(res, delay));
            delay *= 2;
        }
    }
}

function addMessage(text, role) {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    chatInput.value = '';
    typingIndicator.style.display = 'block';

    const response = await fetchGemini(text);

    typingIndicator.style.display = 'none';
    addMessage(response, 'bot');
});

// REVEAL ANIMATIONS
const observer_n = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer_n.observe(el));
