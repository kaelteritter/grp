import { renderProfilesList } from './profile_list.js';
import { renderModal } from './modal.js';

export async function renderApp(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="actions">
            <button id="addProfileBtn" class="btn-primary">Добавить профиль</button>
        </div>
        <div id="profileList"></div>
    `;
    
    await renderProfilesList('profileList');
    
    const addBtn = document.getElementById('addProfileBtn');
    if (addBtn) {
        addBtn.onclick = async () => {
            const modal = await renderModal();
            modal.show();
        };
    }
}