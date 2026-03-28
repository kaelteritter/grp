import { renderProfilesList } from './profile_list.js';
import { renderModal } from './modal.js';
import { showNotification } from './notifications.js';

export async function renderApp(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Рендерим кнопку
    container.innerHTML = `
        <div class="actions">
            <button id="addProfileBtn" class="btn-primary">Добавить профиль</button>
        </div>
        <div id="profileList"></div>
    `;
    
    // Загружаем список профилей
    await renderProfilesList('profileList');
    
    // Инициализируем кнопку добавления
    const addBtn = document.getElementById('addProfileBtn');
    if (addBtn) {
        addBtn.onclick = async () => {
            const modal = await renderModal();
            modal.show();
        };
    }
}