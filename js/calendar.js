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

    const startDate = new Date(start);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const cycleLen = 28; 
    const periodLen = parseInt(localStorage.getItem('period_len') || 5); 
    const isActive = localStorage.getItem('is_active') === 'true';
    
    const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    const dayNumEl = document.getElementById('day-num');
    const daysLeftEl = document.getElementById('days-left');
    const phaseEl = document.getElementById('phase-name');
    const progressEl = document.getElementById('progress-bar');
    const reminder = document.getElementById('end-reminder');

    dayNumEl.innerText = diffDays;

    let isBleeding = (isActive || diffDays <= periodLen);

    if (isBleeding) {
        const left = periodLen - diffDays + 1;
        phaseEl.innerText = "Менструальна фаза 🩸";
        daysLeftEl.innerText = left > 0 ? `кінець за ${left} дн.` : "сьогодні кінець";
        daysLeftEl.style.color = "var(--main-pink)";
        progressEl.style.strokeDasharray = `${(diffDays / periodLen) * 440} 440`;
        progressEl.style.stroke = "var(--main-pink)";
        
        if (isActive && diffDays > periodLen) reminder.style.display = 'block';
        else reminder.style.display = 'none';
    } else {
        reminder.style.display = 'none';
        const daysToNext = cycleLen - ((diffDays - 1) % cycleLen);
        phaseEl.innerText = "Фолікулярна фаза"; // Спрощено для тесту
        daysLeftEl.innerText = `до наступних: ${daysToNext} дн.`;
        daysLeftEl.style.color = "var(--water-blue)";
        progressEl.style.strokeDasharray = `${(((diffDays - 1) % cycleLen) / cycleLen) * 440} 440`;
        progressEl.style.stroke = "var(--water-blue)";
    }
}
function checkPredictionAccuracy() {
    const lastStart = localStorage.getItem('user_start_date');
    if (!lastStart) return;

    const today = new Date();
    const startDate = new Date(lastStart);
    
    // Якщо сьогодні вже 1-й чи 2-й день циклу, запитуємо, чи підтверджує користувач дату
    const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    
    const accuracyCard = document.getElementById('accuracy-check');
    
    // Показуємо картку лише в перші 2 дні нового циклу
    if (diffDays >= 0 && diffDays <= 2) {
        accuracyCard.style.display = 'block';
    } else {
        accuracyCard.style.display = 'none';
    }
}

function confirmPrediction(isAccurate) {
    if (isAccurate) {
        tg.showAlert("Чудово! Ваші прогнози залишаються точними. ✨");
        document.getElementById('accuracy-check').style.display = 'none';
        // Тут можна додати запис у "рейтинг точності"
    }
}
