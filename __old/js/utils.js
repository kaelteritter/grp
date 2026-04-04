// Utility functions
const Utils = {
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    formatBirthDate(profile) {
        const year = profile.birth_year;
        const month = profile.birth_month;
        const day = profile.birth_day;
        
        if (year && month && day) {
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
        if (year && month) {
            return `${year}-${String(month).padStart(2, '0')}`;
        }
        if (year) {
            return `${year}`;
        }
        if (month && day) {
            return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
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
        return sex === 'male' ? '<i class="fas fa-mars"></i>' : '<i class="fas fa-venus"></i>';
    },

    getGenderText(sex) {
        return sex === 'male' ? 'Мужской' : 'Женский';
    }
};