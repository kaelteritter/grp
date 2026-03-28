import { fetchProfiles, deleteProfile } from "../api/profiles.js";
import { formatFullName, formatBirthDate, formatGender } from "../utils/formatters.js";
import { showNotification } from "./notifications.js";
import { renderEditModal } from "./modal.js";

export async function renderProfilesList(containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Container with id "${containerId}" not found`);
        return;
    }

    try {
        container.innerHTML = '<div class="loading">Загрузка профилей...</div>';

        const profiles = await fetchProfiles();

        if (!profiles || profiles.length === 0) {
            container.innerHTML = '<div class="empty-state">Нет загруженных профилей</div>';
            return;
        }

        const profilesHtml = profiles.map(profile => `
            <div class="profile-card" data-profile-id="${profile.id}">
                <div class="profile-card__actions">
                    <button class="btn-icon btn-edit" data-id="${profile.id}" title="Редактировать">
                        ✏️
                    </button>
                    <button class="btn-icon btn-delete" data-id="${profile.id}" title="Удалить">
                        🗑️
                    </button>
                </div>
                <div class="profile-card__content">
                    <h3 class="profile-card__name">${escapeHtml(formatFullName(profile))}</h3>
                    <div class="profile-card__info">
                        <div class="profile-card__info-item">
                            <span class="label">Дата рождения:</span>
                            <span>${escapeHtml(formatBirthDate(profile))}</span>
                        </div>
                        <div class="profile-card__info-item">
                            <span class="label">Пол:</span>
                            <span>${escapeHtml(formatGender(profile.sex))}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="profiles-grid">
                ${profilesHtml}
            </div>
        `;
        
        // Добавляем обработчики для кнопок редактирования
        const editButtons = document.querySelectorAll('.btn-edit');
        editButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const profileId = parseInt(btn.dataset.id);
                const profile = profiles.find(p => p.id === profileId);
                if (profile) {
                    const modal = await renderEditModal(profile);
                    modal.show();
                }
            });
        });
        
        // Добавляем обработчики для кнопок удаления
        const deleteButtons = document.querySelectorAll('.btn-delete');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const profileId = parseInt(btn.dataset.id);
                if (confirm('Вы уверены, что хотите удалить этот профиль?')) {
                    try {
                        await deleteProfile(profileId);
                        showNotification('Профиль успешно удален!', 'success');
                        await renderProfilesList(containerId);
                    } catch (error) {
                        showNotification(error.message, 'error');
                    }
                }
            });
        });
        
    } catch (error) {
        console.error('Error rendering profiles:', error);
        container.innerHTML = `
            <div class="error-state">
                Ошибка загрузки профилей: ${error.message}
                <button onclick="location.reload()">Попробовать снова</button>
            </div>
        `;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}