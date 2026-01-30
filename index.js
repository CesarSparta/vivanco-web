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

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

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

// --- CHATBOT GEMINI ---
const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Mensaje del usuario
const API_KEY = "AIzaSyBVcbvxmnde-Md_x-vbemZADDvcAUPtxVs"; // ¡PEGA TU API KEY DE GEMINI AQUÍ!
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    // Crea un elemento <li> para el chat con el mensaje y la clase
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-rounded">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}

const generateResponse = (chatElement) => {
    // Usamos gemini-pro que es el modelo estándar y evita el error 404
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
    const messageElement = chatElement.querySelector("p");

    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: `Eres un asistente virtual útil y amable para la campaña política de Manuel Vivanco Osorio, candidato a la alcaldía de Huánuco por Renovación Popular. Responde de forma concisa y educada. Pregunta del usuario: ${userMessage}` }]
            }],
            // Configuración para evitar bloqueos en temas políticos
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
            ]
        })
    }

    fetch(API_URL, requestOptions)
        .then(res => {
            if (!res.ok) throw new Error(`Error HTTP: ${res.status}`); // Muestra el código exacto (403, 400, 500)
            return res.json();
        })
        .then(data => {
            // Verificamos si la estructura de la respuesta es correcta
            if (data.candidates && data.candidates[0].content) {
                const responseText = data.candidates[0].content.parts[0].text;
                messageElement.textContent = responseText.replace(/\*\*/g, '');
            } else {
                throw new Error("Respuesta vacía o bloqueada por seguridad");
            }
        })
        .catch((error) => {
            console.error("Detalle del error:", error); // Esto te dirá en la consola qué pasó realmente
            messageElement.classList.add("error");
            if (error.message.includes("403")) {
                messageElement.textContent = "Error: API Key inválida o sin permisos.";
            } else {
                messageElement.textContent = "Lo siento, hubo un error. Revisa la consola (F12).";
            }
        })
        .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}

const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Añadir mensaje del usuario
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    // Mostrar "Escribiendo..." y luego llamar a la API
    setTimeout(() => {
        const incomingChatLi = createChatLi("Escribiendo...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

// Mostrar el chatbot automáticamente después de 5 segundos
setTimeout(() => {
    document.body.classList.add("show-chatbot");
}, 5000);