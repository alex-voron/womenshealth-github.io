function saveProfile() {
    const name = document.getElementById('user-name').value;
    const age = document.getElementById('user-age').value;
    const pLen = document.getElementById('period-duration').value || 5;

    localStorage.setItem('user_name', name);
    localStorage.setItem('user_age', age);
    localStorage.setItem('period_len', pLen);

    if(tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    tg.showAlert("Профіль збережено ✅");
    showPage('main-app');
}

function loadProfileFields() {
    document.getElementById('user-name').value = localStorage.getItem('user_name') || "";
    document.getElementById('user-age').value = localStorage.getItem('user_age') || "";
    document.getElementById('period-duration').value = localStorage.getItem('period_len') || 5;
}