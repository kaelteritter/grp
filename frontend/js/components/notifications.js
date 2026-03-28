let notificationTimeout = null;

export function showNotification(message, type = 'success') {
    // Удаляем существующее уведомление
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }
    
    // Создаем новое уведомление
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Автоматически удаляем через 3 секунды
    notificationTimeout = setTimeout(() => {
        notification.remove();
        notificationTimeout = null;
    }, 3000);
}