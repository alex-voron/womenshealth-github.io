// js/calendar.js

function toggleEndInput(cb) {
    const endInput = document.getElementById('end-date');
    if (endInput) {
        endInput.disabled = cb.checked;
        if(cb.checked) endInput.value = "";
    }
}

function saveCycle() {
    const startInput = document.getElementById('start-date');
    const endInput = document.getElementById('end-date');
    const stillGoingInput = document.getElementById('still-going');

    if (startInput && startInput.value) {
        localStorage.setItem('user_start_date', startInput.value);
        if (endInput) localStorage.setItem('user_end_date', endInput.value);
        if (stillGoingInput) localStorage.setItem('is_active', stillGoingInput.checked);
        
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
        showPage('main-app');
    } else {
        tg.showAlert("Будь ласка, вкажіть дату початку циклу 🩸");
    }
}

// ГОЛОВНА ФУНКЦІЯ МАЛЮВАННЯ ГЛАВНОГО ЕКРАНУ
function renderData() {
    const start = localStorage.getItem('user_start_date');
    const dayNumEl = document.getElementById('day-num');
    const daysLeftEl = document.getElementById('days-left');
    const phaseEl = document.getElementById('phase-name');
    const progressEl = document.getElementById('progress-bar');
    const reminder = document.getElementById('end-reminder');

    // ЗАХИСТ: Якщо елементів немає на екрані — виходимо
    if (!dayNumEl || !daysLeftEl || !phaseEl || !progressEl) return;

    if (!start) {
        // Даних немає — показуємо нагадування про налаштування
        dayNumEl.innerText = "?";
        phaseEl.innerText = "Налаштуйте цикл";
        daysLeftEl.innerText = "в профілі";
        progressEl.style.strokeDasharray = "0 440";
        return;
    }

    const startDate = new Date(start);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // ПАРАМЕТРИ З ПРОФІЛЮ (Flo-style)
    const cycleLen = parseInt(localStorage.getItem('cycle_len') || 28); 
    const periodLen = parseInt(localStorage.getItem('period_len') || 5); 
    const isActive = localStorage.getItem('is_active') === 'true';
    
    // Математика: Поточний день циклу
    const diffTime = today - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const currentDay = diffDays + 1; // 1-й день циклу

    // ВІДОБРАЖЕННЯ
    dayNumEl.innerText = currentDay;

    // ЛОГІКА СТАНІВ (Flo)
    let isBleeding = (isActive || currentDay <= periodLen);

    if (currentDay > cycleLen) {
        // СТАН С: ЗАЙДЕРЖКА (Сірий колір Flo)
        const delayDays = currentDay - cycleLen;
        phaseEl.innerText = "Затримка 🐢";
        phaseEl.style.color = "var(--flo-grey)";
        daysLeftEl.innerText = `${delayDays} дн.`;
        daysLeftEl.style.color = "var(--flo-grey)";
        progressEl.style.stroke = "var(--flo-grey)";
        progressEl.style.strokeDasharray = "440 440"; // Повне сіре коло
        if (reminder) reminder.style.display = 'none';

    } else if (isBleeding) {
        // СТАН А: МІСЯЧНІ (Рожевий колір Flo)
        const left = periodLen - currentDay + 1;
        phaseEl.innerText = "Менструальна фаза 🩸";
        phaseEl.style.color = "var(--flo-pink)";
        daysLeftEl.innerText = left > 0 ? `кінець за ${left} дн.` : "сьогодні останній день";
        daysLeftEl.style.color = "var(--flo-pink)";
        
        // Математика прогресу
        const progressValue = Math.min((currentDay / periodLen) * 440, 440);
        progressEl.style.strokeDasharray = `${progressValue} 440`;
        progressEl.style.stroke = "var(--flo-pink)";
        
        // Нагадування про затримку закінчення
        if (reminder) {
            reminder.style.display = (isActive && currentDay > periodLen) ? 'block' : 'none';
        }
    } else {
        // СТАН Б: ОЧІКУВАННЯ / ОВУЛЯЦІЯ (Бірюзовий колір Flo)
        if (reminder) reminder.style.display = 'none';
        
        // Дні до наступних (рахуємо відносно cycleLen)
        const daysToNext = cycleLen - currentDay + 1;
        
        // Визначаємо фази
        let phaseName = "Фолікулярна фаза";
        let phaseColor = "var(--text-dark)";
        
        if (currentDay > 12 && currentDay <= 16) {
            phaseName = "Овуляція ✨";
            phaseColor = "var(--flo-teal)";
        } else if (currentDay > 16) {
            phaseName = "Лютеїнова фаза";
            phaseColor = "#d35400"; // Помаранчевий
        }
        
        phaseEl.innerText = phaseName;
        phaseEl.style.color = phaseColor;
        
        daysLeftEl.innerText = `до наступних: ${daysToNext} дн.`;
        daysLeftEl.style.color = "var(--water-blue)";
        
        // Математика прогресу циклу
        const progressValue = (currentDay / cycleLen) * 440;
        progressEl.style.strokeDasharray = `${progressValue} 440`;
        progressEl.style.stroke = "var(--flo-teal)"; // Загальний колір очікування
    }

    // --- ОНОВЛЮЄМО "СТОРІЗ ДНЯ" ---
    if (typeof updateDailyStory === "function") {
        updateDailyStory(currentDay);
    } else {
        console.error("Функцію updateDailyStory не знайдено в js/features.js!");
    }
}

function checkPredictionAccuracy() {
    const accuracyCard = document.getElementById('accuracy-check');
    if (!accuracyCard) return;

    const lastStart = localStorage.getItem('user_start_date');
    if (!lastStart) {
        accuracyCard.style.display = 'none';
        return;
    }

    const today = new Date();
    const startDate = new Date(lastStart);
    const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    
    // Поки що залишаємо true для тесту, щоб ти побачив блок
    if (true) { 
        accuracyCard.style.display = 'block';
    } else {
        accuracyCard.style.display = 'none';
    }
}

function confirmPrediction(isAccurate) {
    if (isAccurate) {
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.showAlert("Чудово! Ваші прогнози залишаються точними. ✨");
        }
        document.getElementById('accuracy-check').style.display = 'none';
    }
}
function updateDailyStory(day) {
    const storyEl = document.getElementById('story-text');
    if (!storyEl) return;

    let story = "";
    if (day <= 5) {
        story = "Рівень прогестерону низький. Це час для відпочинку. Твій організм оновлюється.";
    } else if (day <= 12) {
        story = "Естроген зростає. Ти відчуваєш приплив енергії та креативності. Гарний час для нових справ!";
    } else if (day <= 16) {
        story = "Період овуляції. Шанси на вагітність найвищі. Шкіра виглядає сяючою ✨";
    } else if (day <= 28) {
        story = "Обмін речовин прискорюється. Може з'явитися бажання з'їсти щось солодке. Будь ніжною до себе.";
    } else {
        story = "Затримка — це нормально при стресі, але якщо вона триває довго, варто зробити тест або звернутися до лікаря.";
    }
    
    storyEl.innerText = story;
}
