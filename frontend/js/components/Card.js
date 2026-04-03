class Card {
    static render(profile) {
        const fullName = Utils.getFullName(profile);
        const birthDate = Utils.formatBirthDate(profile);
        const avatarHtml = this.getAvatarHtml(profile, fullName);
        const socialLinks = this.getSocialLinks(profile);
        const locationName = profile.current_location ? profile.current_location.name : '';
        
        return `
            <div class="profile-card" data-profile-id="${profile.id}">
                <div class="profile-avatar">
                    ${avatarHtml}
                    <div class="profile-hover-info">
                        <div class="hover-name">${Utils.escapeHtml(fullName)}</div>
                        <div class="hover-details">
                            ${birthDate ? `<div class="hover-detail"><span class="hover-icon">📅</span> ${birthDate}</div>` : ''}
                            <div class="hover-detail"><span class="hover-icon">${Utils.getGenderIcon(profile.sex)}</span> ${Utils.getGenderText(profile.sex)}</div>
                            ${locationName ? `<div class="hover-detail"><span class="hover-icon">📍</span> ${Utils.escapeHtml(locationName)}</div>` : ''}
                            ${socialLinks ? `<div class="hover-links">${socialLinks}</div>` : ''}
                        </div>
                    </div>
                </div>
                <div class="profile-actions">
                    <button class="action-btn edit" data-edit="${profile.id}" title="Редактировать">✏️</button>
                    <button class="action-btn delete" data-delete="${profile.id}" title="Удалить">🗑️</button>
                </div>
            </div>
        `;
    }

    static getAvatarHtml(profile, fullName) {
        if (profile.photos && profile.photos.length > 0) {
            return `<img src="${profile.photos[0].url}" alt="${Utils.escapeHtml(fullName)}" loading="lazy">`;
        }
        
        const initials = Utils.getAvatarInitials(fullName);
        return `<div class="avatar-placeholder">${initials}</div>`;
    }

    static getSocialLinks(profile) {
        if (!profile.links || profile.links.length === 0) {
            return '';
        }
        
        return profile.links.map(link => `
            <a href="${Utils.escapeHtml(link.url)}" target="_blank" class="hover-social-link" onclick="event.stopPropagation()">
                ${Utils.escapeHtml(link.platform.name)}
            </a>
        `).join('');
    }
}