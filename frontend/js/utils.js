// Utility functions
const Utils = {
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    formatBirthDate(profile) {
        const parts = [];
        if (profile.birth_day) parts.push(profile.birth_day);
        if (profile.birth_month) parts.push(profile.birth_month);
        if (profile.birth_year) parts.push(profile.birth_year);
        
        if (parts.length === 3) return `${parts[0]}.${parts[1]}.${parts[2]}`;
        if (parts.length === 2) return `${parts[0]}.${parts[1]}`;
        if (parts.length === 1) return `${parts[0]}`;
        return '';
    },

    getFullName(profile) {
        const parts = [profile.last_name, profile.first_name, profile.middle_name];
        const fullName = parts.filter(p => p).join(' ');
        return fullName || 'Без имени';
    },

    getAvatarInitials(fullName) {
        const words = fullName.split(' ');
        if (words.length >= 2) {
            return `${words[0][0]}${words[1][0]}`.toUpperCase();
        }
        if (words.length === 1 && words[0]) {
            return words[0][0].toUpperCase();
        }
        return '👤';
    },

    getGenderIcon(sex) {
        return sex === 'male' ? '👨' : '👩';
    },

    getGenderText(sex) {
        return sex === 'male' ? 'Мужской' : 'Женский';
    }
};