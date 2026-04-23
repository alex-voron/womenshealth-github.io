function toggleEndInput(cb) {
    const endInput = document.getElementById('end-date');
    endInput.disabled = cb.checked;
    if(cb.checked) endInput.value = "";
}

function saveCycle() {
    localStorage.setItem('user_start_date', document.getElementById('start-date').value);
    localStorage.setItem('user_end_date', document.getElementById('end-date').value);
    localStorage.setItem('is_active', document.getElementById('still-going').checked);
    showPage('main-app');
}

function renderData() {
    const start = localStorage.getItem('user_start_date');
    if (!start) return;

    // Отримуємо елементи
    const dayNumEl = document.getElementById('day-num');
    const daysLeftEl = document.getElementById('days-left');
    const phaseEl = document.getElementById('phase-name');
    const progressEl = document.getElementById('progress-bar');
    const reminder = document.getElementById('end-reminder');

    // КРИТИЧНО: Перевіряємо, чи всі елементи існують на сторінці
    if (!dayNumEl || !daysLeftEl || !phaseEl || !progressEl) {
        console.error("Деякі елементи інтерфейсу не знайдено!");
        return;
    }

    const startDate = new Date(start);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const cycleLen = 28; 
    const periodLen = parseInt(localStorage.getItem('period_len') || 5); 
    const isActive = localStorage.getItem('is_active') === 'true';
    
    const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    dayNumEl.innerText = diffDays;

    let isBleeding = (isActive || diffDays <= periodLen);

    if (isBleeding) {
        const left = periodLen - diffDays + 1;
        phaseEl.innerText = "Менструальна фаза 🩸";
        daysLeftEl.innerText = left > 0 ? `кінець за ${left} дн.` : "сьогодні кінець";
        daysLeftEl.style.color = "var(--main-pink)";
        
        // Математика прогресу для місячних
        const progressValue = Math.min((diffDays / periodLen) * 440, 440);
        progressEl.style.strokeDasharray = `${progressValue} 440`;
        progressEl.style.stroke = "var(--main-pink)";
        
        if (reminder) {
            reminder.style.display = (isActive && diffDays > periodLen) ? 'block' : 'none';
        }
    } else {
        if (reminder) reminder.style.display = 'none';
        
        const daysToNext = cycleLen - ((diffDays - 1) % cycleLen);
        phaseEl.innerText = "Фолікулярна фаза";
        daysLeftEl.innerText = `до наступних: ${daysToNext} дн.`;
        daysLeftEl.style.color = "var(--water-blue)";
        
        // Математика прогресу для циклу
        const cycleDay = (diffDays - 1) % cycleLen;
        const progressValue = (cycleDay / cycleLen) * 440;
        progressEl.style.strokeDasharray = `${progressValue} 440`;
        progressEl.style.stroke = "var(--water-blue)";
    }

    // Викликаємо перевірку тільки якщо вона існує
    if (typeof checkPredictionAccuracy === "function") {
        checkPredictionAccuracy(); 
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
