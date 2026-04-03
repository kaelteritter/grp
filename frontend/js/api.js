const API_BASE_URL = 'http://localhost:8000/api/v1';

class API {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (response.status === 204) {
                return null;
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async getProfiles() {
        return this.request('/profiles/');
    }

    async getProfile(id) {
        return this.request(`/profiles/${id}`);
    }

    async createProfile(profile) {
        return this.request('/profiles/', {
            method: 'POST',
            body: JSON.stringify(profile),
        });
    }

    async updateProfile(id, profile) {
        return this.request(`/profiles/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(profile),
        });
    }

    async deleteProfile(id) {
        return this.request(`/profiles/${id}`, {
            method: 'DELETE',
        });
    }

    async getPhotos(profileId) {
        return this.request(`/photos/?profile_id=${profileId}`);
    }

    async getLinks(profileId) {
        return this.request(`/links/?profile_id=${profileId}`);
    }
    async createLink(linkData) {
        return this.request('/links/', {
            method: 'POST',
            body: JSON.stringify(linkData),
        });
    }

    async getPlatforms() {
        return this.request('/platforms/');
    }
}



const api = new API();