class Card {
    static render(profile) {
        const fullName = Utils.getFullName(profile);
        const birthDate = Utils.formatBirthDate(profile);
        const avatarHtml = this.getAvatarHtml(profile, fullName);
        const socialLinks = this.getSocialLinks(profile);
        const locationName = profile.current_location ? profile.current_location.name : '';
        const regionName = profile.current_location?.region?.name || '';
        const countryName = profile.current_location?.region?.country?.name || '';
        const fullLocation = [locationName, regionName, countryName].filter(l => l).join(', ');
        
        return `
            <div class="profile-card" data-profile-id="${profile.id}">
                <div class="profile-avatar" data-avatar-click="${profile.id}" data-has-photos="${profile.photos && profile.photos.length > 0}">
                    ${avatarHtml}
                </div>
                <div class="profile-info">
                    <div class="profile-name" data-name-click="${profile.id}">
                        ${Utils.escapeHtml(fullName)}
                    </div>
                    <div class="profile-details">
                        ${birthDate ? `<p>📅 ${birthDate}</p>` : ''}
                        <p>${Utils.getGenderIcon(profile.sex)}</p>
                        ${fullLocation ? `<p>📍 ${Utils.escapeHtml(fullLocation)}</p>` : ''}
                    </div>
                    ${socialLinks ? `<div class="social-links">${socialLinks}</div>` : ''}
                </div>
                <div class="profile-actions">
                    <button class="action-btn edit" data-edit="${profile.id}" title="Редактировать">✏️</button>
                    <button class="action-btn delete" data-delete="${profile.id}" title="Удалить">🗑️</button>
                </div>
            </div>
        `;
    }

    static getAvatarHtml(profile, fullName) {
        let avatarPhoto = null;
        if (profile.photos && profile.photos.length > 0) {
            avatarPhoto = profile.photos.find(p => p.is_avatar) || profile.photos[0];
            // Используем полный URL бэкенда
            const photoUrl = `http://localhost:8000${avatarPhoto.url}`;
            return `<img src="${photoUrl}" alt="${Utils.escapeHtml(fullName)}" loading="lazy">`;
        }
        
        const initials = Utils.getAvatarInitials(fullName);
        return `<div class="avatar-placeholder">${initials}</div>`;
    }

    static getSocialLinks(profile) {
        if (!profile.links || profile.links.length === 0) {
            return '';
        }
        
        return profile.links.map(link => `
            <a href="${Utils.escapeHtml(link.url)}" target="_blank" class="social-link" onclick="event.stopPropagation()">
                🔗 ${Utils.escapeHtml(link.platform.name)}
            </a>
        `).join('');
    }
}