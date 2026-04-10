const API_BASE_URL = 'http://localhost:8000/api/v1';

const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
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
      return { data: null };
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('API Error:', { status: response.status, data });
      throw new Error(data.detail || `HTTP error! status: ${response.status}`);
    }

    return { data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const profileApi = {
  getAll: (skip = 0, limit = 20) => request(`/profiles/?skip=${skip}&limit=${limit}`),
  get: (id) => request(`/profiles/${id}`),
  create: (data) => {
    // Убираем undefined значения и преобразуем пустые строки в null
    const cleanData = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== '') {
        cleanData[key] = value === '' ? null : value;
      } else if (value === '') {
        cleanData[key] = null;
      } else {
        cleanData[key] = value;
      }
    }
    return request('/profiles/', {
      method: 'POST',
      body: JSON.stringify(cleanData)
    });
  },
  update: (id, data) => {
    const cleanData = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== '') {
        cleanData[key] = value === '' ? null : value;
      }
    }
    return request(`/profiles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(cleanData)
    });
  },
  delete: (id) => request(`/profiles/${id}`, { method: 'DELETE' }),
};

export const photoApi = {
  getByProfile: (profileId) => request(`/photos/?profile_id=${profileId}`),
  uploadMultiple: async (profileId, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('profile_id', profileId);

    const response = await fetch(`http://localhost:8000/api/v1/photos/multiple/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
  },
  setAvatar: (profileId, photoId) => request(`/photos/profile/${profileId}/avatar/${photoId}`, { method: 'PATCH' }),
  delete: (photoId) => request(`/photos/${photoId}`, { method: 'DELETE' }),
};

export const platformApi = {
  getAll: () => request('/platforms/'),
  create: (data) => request('/platforms/', { method: 'POST', body: JSON.stringify(data) }),
};

export const locationApi = {
  getAll: () => request('/locations/'),
  create: (data) => request('/locations/', { method: 'POST', body: JSON.stringify(data) }),
};

export const regionApi = {
  getAll: () => request('/regions/'),
  create: (data) => request('/regions/', { method: 'POST', body: JSON.stringify(data) }),
};

export const countryApi = {
  getAll: () => request('/countries/'),
  create: (data) => request('/countries/', { method: 'POST', body: JSON.stringify(data) }),
};

export const linkApi = {
  create: (data) => request('/links/', { method: 'POST', body: JSON.stringify(data) }),
};