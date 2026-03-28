// frontend/js/core/formatters.js

export function formatFullName(profile) {
    const nameParts = [
        profile.last_name,
        profile.first_name,
        profile.middle_name
    ].filter(part => part && part.trim());

    return nameParts.length > 0 ? nameParts.join(' ') : 'Не указано имя'
}

export function formatBirthDate(profile) {
    const {birth_year, birth_month, birth_day} = profile;
    return `${birth_year || 'YYYY'}-${birth_month || 'MM'}-${birth_day || 'DD'}`
}

export function formatGender(gender) {
    switch (gender) {
        case 'male':
            return 'М';
        case 'female':
            return 'Ж';
        default:
            return 'Не указан'
    }
}