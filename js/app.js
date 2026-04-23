// js/app.js
let tg = window.Telegram.WebApp;
if (tg) {
    tg.expand();
    tg.ready();
}

// Універсальна функція перемикання сторінок
function showPage(pageId) {
    // Приховуємо всі сторінки
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Показуємо потрібну
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    } else {
        console.error(`Сторінку з id "${pageId}" не знайдено!`);
        return;
    }

    // ЛОГІКА ЗАПУСКУ МОДУЛІВ
    if (pageId === 'main-app') {
        // Якщо ми на головній — запускаємо календар
        if (typeof renderData === "function") {
            renderData(); 
        } else {
            console.error("Функцію renderData не знайдено в js/calendar.js!");
        }
    }
    
    if (pageId === 'profile-page') {
        // Якщо в профілі — завантажуємо поля
        if (typeof loadProfileFields === "function") {
            loadProfileFields();
        }
    }
}

// Головна подія запуску
document.addEventListener('DOMContentLoaded', () => {
    // Спробуємо завантажити поля профілю про всяк випадок
    if (typeof loadProfileFields === "function") loadProfileFields();

    // Визначаємо куди зайти
    const startDate = localStorage.getItem('user_start_date');
    if (startDate) {
        showPage('main-app'); // Якщо дані є — на головну
    } else {
        showPage('welcome-page'); // Якщо немає — на привітання
    }
});
