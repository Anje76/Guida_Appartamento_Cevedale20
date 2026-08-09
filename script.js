// ========================================
// TRADUZIONI
// ========================================
const translations = {
    it: {
        welcome_title: "BENVENUTI!",
        welcome_text: "Tocca le icone per scoprire tutte le informazioni utili per il tuo soggiorno.",
        location: "Posizione",
        checkin: "Check-in & Check-out",
        rules: "Regole",
        wifi: "Wi-Fi",
        appliances: "Istruzioni",
        waste: "Rifiuti",
        places: "Cose da visitare",
        tours: "Escursioni",
        tips: "Consigli locali",
        transport: "Trasporti",
        emergencies: "Emergenze",
        contact: "Contattaci"
    },
    en: {
        welcome_title: "WELCOME!",
        welcome_text: "Tap the icons to discover all useful information for your stay.",
        location: "Location",
        checkin: "Check-in & Check-out",
        rules: "Rules",
        wifi: "Wi-Fi",
        appliances: "Appliances",
        waste: "Waste",
        places: "Places to visit",
        tours: "Excursions",
        tips: "Local tips",
        transport: "Transport",
        emergencies: "Emergencies",
        contact: "Contact us"
    }
};

// ========================================
// GESTIONE LINGUA
// ========================================
let currentLang = 'it';

function setLanguage(lang) {
    currentLang = lang;
    
    // Aggiorna pulsanti attivi
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // Traduci tutti gli elementi con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    
    // Salva preferenza
    localStorage.setItem('preferred_language', lang);
}

// Event listeners per pulsanti lingua
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        setLanguage(btn.dataset.lang);
    });
});

// Carica lingua salvata
const savedLang = localStorage.getItem('preferred_language') || 'it';
setLanguage(savedLang);

// ========================================
// COPIA CODICE PORTA
// ========================================
function copyCode() {
    const code = document.getElementById('doorCode').textContent;
    copyToClipboard(code, 'Codice porta copiato!');
}

// ========================================
// COPIA PASSWORD WI-FI
// ========================================
function copyWifi() {
    const pass = document.getElementById('wifiPass').textContent;
    copyToClipboard(pass, 'Password Wi-Fi copiata!');
}

// ========================================
// FUNZIONE COPIA GENERICA
// ========================================
function copyToClipboard(text, successMsg = 'Copiato!') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(successMsg);
        }).catch(() => {
            fallbackCopy(text, successMsg);
        });
    } else {
        fallbackCopy(text, successMsg);
    }
}

function fallbackCopy(text, successMsg) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast(successMsg);
    } catch (err) {
        showToast('Errore: non posso copiare');
    }
    document.body.removeChild(textarea);
}

// ========================================
= // TOAST NOTIFICATION
// ========================================
function showToast(message) {
    // Rimuovi toast esistente
    const existing = document.querySelector('.toast-message');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: #1a3a2a;
        color: white;
        padding: 12px 24px;
        border-radius: 30px;
        font-weight: 600;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideUp 0.4s ease;
        font-size: 15px;
        max-width: 90%;
        text-align: center;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Aggiungi keyframes per l'animazione
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
`;
document.head.appendChild(style);

// ========================================
// SCROLL SMOOTH PER LINK INTERNI
// ========================================
document.querySelectorAll('.menu-item[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

console.log('✅ App Ceved