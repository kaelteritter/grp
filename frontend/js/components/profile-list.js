// frontend/js/components/profile-list.js

import { fetchProfiles } from "../api/profiles.js";   
import { formatFullName, formatBirthDate, formatGender } from "../utils/formatters.js";

export async function renderProfilesList(containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Container with id "${containerId}" not found`);
        return;
    }

    try {
        container.innerHTML = '<div class="loading">Загрузка профилей...</div>';

        const profiles = await fetchProfiles();

        if (!profiles) {
            container.innerHTML = '<div class="empty-state">Нет загруженных профилей</div>';
            return;
        }

        // Рендерим карточки
        const profilesHtml = profiles.map(profile => `
            <div class="profile-card" data-profile-id="${profile.id}">
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
    }

    catch (error) {
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
