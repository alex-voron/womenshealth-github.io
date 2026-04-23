// js/calendar.js

function toggleEndInput(cb) {
    const endInput = document.getElementById('end-date');
    if (!endInput) return;

    if (cb.checked) {
        endInput.disabled = true;
        endInput.style.opacity = "0.5";
        endInput.value = ""; // Очищаємо, бо ще не закінчилися
    } else {
        endInput.disabled = false;
        endInput.style.opacity = "1";
        
        // Автоматична підказка: якщо вибрали "не тривають", 
        // пропонуємо дату через 4 дні від початку
        const startVal = document.getElementById('start-date').value;
        if (startVal) {
            let suggestEnd = new Date(startVal);
            suggestEnd.setDate(suggestEnd.getDate() + 4);
            endInput.value = suggestEnd.toISOString().split('T')[0];
        }
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

function renderData() {
    const start = localStorage.getItem('user_start_date');
    const dayNumEl = document.getElementById('day-num');
    const daysLeftEl = document.getElementById('days-left');
    const phaseEl = document.getElementById('phase-name');
    const progressEl = document.getElementById('progress-bar');
    const reminder = document.getElementById('end-reminder');

    if (!dayNumEl || !daysLeftEl || !phaseEl || !progressEl) return;

    if (!start) {
        dayNumEl.innerText = "?";
        phaseEl.innerText = "Налаштуйте цикл";
        daysLeftEl.innerText = "в профілі";
        progressEl.style.strokeDasharray = "0 440";
        return;
    }

    const startDate = new Date(start);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const cycleLen = parseInt(localStorage.getItem('cycle_len') || 28); 
    const periodLen = parseInt(localStorage.getItem('period_len') || 5); 
    const isActive = localStorage.getItem('is_active') === 'true';
    
    const diffTime = today - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const currentDay = diffDays + 1; // Сьогодні — день №1

    dayNumEl.innerText = currentDay;

    let isBleeding = (isActive || currentDay <= periodLen);

    if (currentDay > cycleLen) {
        const delayDays = currentDay - cycleLen;
        phaseEl.innerText = "Затримка 🐢";
        phaseEl.style.color = "var(--flo-grey)";
        daysLeftEl.innerText = `${delayDays} дн.`;
        daysLeftEl.style.color = "var(--flo-grey)";
        progressEl.style.stroke = "var(--flo-grey)";
        progressEl.style.strokeDasharray = "440 440";
        if (reminder) reminder.style.display = 'none';

    } else if (isBleeding) {
        // ВИПРАВЛЕНО: Рахуємо майбутні дні без "сьогодні"
        const left = periodLen - currentDay; 
        
        phaseEl.innerText = "Менструальна фаза 🩸";
        phaseEl.style.color = "var(--flo-pink)";
        
        if (left > 0) {
            daysLeftEl.innerText = `залишилося ${left} дн.`;
        } else {
            daysLeftEl.innerText = "останній день";
        }
        
        daysLeftEl.style.color = "var(--flo-pink)";
        
        const progressValue = Math.min((currentDay / periodLen) * 440, 440);
        progressEl.style.strokeDasharray = `${progressValue} 440`;
        progressEl.style.stroke = "var(--flo-pink)";
        
        if (reminder) {
            reminder.style.display = (isActive && currentDay > periodLen) ? 'block' : 'none';
        }
    } else {
        if (reminder) reminder.style.display = 'none';
        
        // ВИПРАВЛЕНО: Чиста математика залишку до кінця циклу
        const daysToNext = cycleLen - currentDay;
        
        let phaseName = "Фолікулярна фаза";
        let phaseColor = "var(--text-dark)";
        
        if (currentDay > 12 && currentDay <= 16) {
            phaseName = "Овуляція ✨";
            phaseColor = "var(--flo-teal)";
        } else if (currentDay > 16) {
            phaseName = "Лютеїнова фаза";
            phaseColor = "#d35400";
        }
        
        phaseEl.innerText = phaseName;
        phaseEl.style.color = phaseColor;
        
        daysLeftEl.innerText = daysToNext > 0 ? `до наступних: ${daysToNext} дн.` : "завтра новий цикл";
        daysLeftEl.style.color = "var(--water-blue)";
        
        const progressValue = (currentDay / cycleLen) * 440;
        progressEl.style.strokeDasharray = `${progressValue} 440`;
        progressEl.style.stroke = "var(--flo-teal)";
    }

    if (typeof updateDailyStory === "function") {
        updateDailyStory(currentDay);
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
    
    // Поки що true для тесту
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
        const card = document.getElementById('accuracy-check');
        if (card) card.style.display = 'none';
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
