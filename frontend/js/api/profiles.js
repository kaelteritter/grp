// frontend/js/api/profiles.js

const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function fetchProfiles() {
    try {
        const response = await fetch(`${API_BASE_URL}/profiles/`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error(`Ошибка загрузка профилей: ${error}`);
        throw error;
    }
}

export async function createProfile(profileData) {
    try {
        const endpoint = `${API_BASE_URL}/profiles/`;
        const attrs = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData)
        }
        const response = await fetch(endpoint, attrs);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Ошибка создания профиля:', error);
        throw error;
    }
}