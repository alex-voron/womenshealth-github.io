let tg = window.Telegram.WebApp;
tg.expand();

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    // При переході на головну оновлюємо дані
    if (pageId === 'main-app') {
        if (typeof renderData === "function") renderData();
    }
}

// Подія завантаження сторінки
window.onload = () => {
    // Ініціалізація полів профілю
    loadProfileFields();
    
    // Перевірка куди заходити
    if (localStorage.getItem('user_start_date')) {
        showPage('main-app');
    }
};