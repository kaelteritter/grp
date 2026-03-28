// frontend/js/api/profiles.js

const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function fetchProfiles() {
    try {
        const response = await fetch(`${API_BASE_URL}/profiles`);
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