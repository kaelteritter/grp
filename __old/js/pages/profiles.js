console.log('profiles.js loaded');

class ProfilesPage {
    constructor() {
        console.log('ProfilesPage constructor called');
        this.profiles = [];
        this.currentEditId = null;
        this.locations = [];
        this.regions = [];
        this.countries = [];
        this.platforms = [];
        this.isLoading = false;
    }

    async init() {
        console.log('ProfilesPage.init() STARTED');
        try {
            if (typeof Loading !== 'undefined') Loading.show();
            
            await Promise.all([
                this.loadCountries(),
                this.loadRegions(),
                this.loadLocations(),
                this.loadPlatforms()
            ]);
            
            console.log('All data loaded, loading profiles...');
            await this.loadProfiles();
            this.attachEvents();
            
            console.log('ProfilesPage.init() COMPLETED');
        } catch (error) {
            console.error('Init error:', error);
            if (typeof Toast !== 'undefined') {
                Toast.show('Ошибка инициализации: ' + error.message, 'error');
            }
        } finally {
            if (typeof Loading !== 'undefined') Loading.hide();
        }
    }

    async loadCountries() {
        try {
            const response = await fetch('http://localhost:8000/api/v1/countries/');
            if (response.ok) {
                this.countries = await response.json();
                console.log(`Loaded ${this.countries.length} countries`);
            }
        } catch (error) {
            console.error('Error loading countries:', error);
        }
    }

    async loadRegions() {
        try {
            const response = await fetch('http://localhost:8000/api/v1/regions/');
            if (response.ok) {
                this.regions = await response.json();
                console.log(`Loaded ${this.regions.length} regions`);
            }
        } catch (error) {
            console.error('Error loading regions:', error);
        }
    }

    async loadLocations() {
        try {
            const response = await fetch('http://localhost:8000/api/v1/locations/');
            if (response.ok) {
                this.locations = await response.json();
                console.log(`Loaded ${this.locations.length} locations`);
            }
        } catch (error) {
            console.error('Error loading locations:', error);
        }
    }

    async loadPlatforms() {
        try {
            const response = await fetch('http://localhost:8000/api/v1/platforms/');
            if (response.ok) {
                this.platforms = await response.json();
                console.log(`Loaded ${this.platforms.length} platforms`);
            }
        } catch (error) {
            console.error('Error loading platforms:', error);
        }
    }

    async loadProfiles() {
        console.log('loadProfiles() called');
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            this.profiles = await api.getProfiles();
            console.log(`Loaded ${this.profiles.length} profiles`);
            this.render();
        } catch (error) {
            console.error('Error loading profiles:', error);
            const errorMsg = document.getElementById('error');
            if (errorMsg) {
                errorMsg.textContent = 'Ошибка загрузки профилей: ' + error.message;
                errorMsg.classList.remove('hidden');
            }
        } finally {
            this.isLoading = false;
        }
    }

    render() {
        console.log('render() called, profiles count:', this.profiles?.length);
        const grid = document.getElementById('profilesGrid');
        
        if (!grid) {
            console.error('profilesGrid element not found!');
            return;
        }
        
        if (!this.profiles || this.profiles.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <p>✨ Нет добавленных профилей</p>
                    <button class="btn-minimal primary" id="emptyAddBtn">Добавить первый профиль</button>
                </div>
            `;
            const emptyBtn = document.getElementById('emptyAddBtn');
            if (emptyBtn) {
                emptyBtn.addEventListener('click', () => this.openProfileModal());
            }
            return;
        }

        grid.innerHTML = this.profiles.map(profile => Card.render(profile)).join('');
        this.attachCardEvents();
    }

    attachCardEvents() {
        document.querySelectorAll('[data-avatar-click]').forEach(el => {
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
            
            newEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const profileId = parseInt(newEl.dataset.avatarClick);
                const profile = this.profiles.find(p => p.id === profileId);
                
                if (profile && profile.photos && profile.photos.length > 0) {
                    this.openSlideshow(profile);
                } else {
                    Toast.show('У этого профиля нет фотографий', 'error');
                }
            });
        });
        
        document.querySelectorAll('[data-name-click]').forEach(el => {
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
            
            newEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const profileId = parseInt(newEl.dataset.nameClick);
                window.location.href = `/profile.html?id=${profileId}`;
            });
        });

        document.querySelectorAll('[data-edit]').forEach(el => {
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
            
            newEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const profileId = parseInt(newEl.dataset.edit);
                this.editProfile(profileId);
            });
        });

        document.querySelectorAll('[data-delete]').forEach(el => {
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
            
            newEl.addEventListener('click', async (e) => {
                e.stopPropagation();
                const profileId = parseInt(newEl.dataset.delete);
                await this.deleteProfile(profileId);
            });
        });
    }

    openSlideshow(profile) {
        const modal = document.getElementById('slideshowModal');
        const slideshowImages = document.getElementById('slideshowImages');
        const slideshowAuthor = document.getElementById('slideshowAuthor');
        const slideshowCounter = document.getElementById('slideshowCounter');
        
        this.currentProfile = profile;
        this.currentSlideshowPhotos = profile.photos;
        this.currentPhotoIndex = 0;
        
        // Используем полный URL бэкенда
        const photoUrl = `http://localhost:8000${profile.photos[0].url}`;
        
        slideshowImages.innerHTML = `
            <div class="slideshow-slide active">
                <img src="${photoUrl}" alt="Фото">
            </div>
        `;
        
        const fullName = Utils.getFullName(profile);
        slideshowAuthor.innerHTML = `
            <div class="slideshow-author" data-profile-id="${profile.id}">
                <div class="slideshow-avatar">
                    <img src="${photoUrl}" alt="${fullName}">
                </div>
                <div class="slideshow-name">${Utils.escapeHtml(fullName)}</div>
            </div>
        `;
        
        slideshowCounter.textContent = `1 / ${profile.photos.length}`;
        modal.classList.remove('hidden');
        this.updateSlideshowControls();
        
        const authorDiv = document.querySelector('.slideshow-author');
        if (authorDiv) {
            authorDiv.onclick = () => {
                window.location.href = `/profile.html?id=${profile.id}`;
            };
        }
    }
    
    updateSlideshowControls() {
        const prevBtn = document.getElementById('slideshowPrev');
        const nextBtn = document.getElementById('slideshowNext');
        const counter = document.getElementById('slideshowCounter');
        
        if (prevBtn) {
            prevBtn.style.display = this.currentPhotoIndex === 0 ? 'none' : 'flex';
            prevBtn.onclick = () => this.prevPhoto();
        }
        if (nextBtn) {
            nextBtn.style.display = this.currentPhotoIndex === this.currentSlideshowPhotos.length - 1 ? 'none' : 'flex';
            nextBtn.onclick = () => this.nextPhoto();
        }
        if (counter) {
            counter.textContent = `${this.currentPhotoIndex + 1} / ${this.currentSlideshowPhotos.length}`;
        }
    }

    prevPhoto() {
        if (this.currentPhotoIndex > 0) {
            this.currentPhotoIndex--;
            this.updateSlideImage();
        }
    }

    nextPhoto() {
        if (this.currentPhotoIndex < this.currentSlideshowPhotos.length - 1) {
            this.currentPhotoIndex++;
            this.updateSlideImage();
        }
    }

    updateSlideImage() {
        const slideshowImages = document.getElementById('slideshowImages');
        const currentPhoto = this.currentSlideshowPhotos[this.currentPhotoIndex];
        // Используем полный URL бэкенда
        const photoUrl = `http://localhost:8000${currentPhoto.url}`;
        
        slideshowImages.innerHTML = `
            <div class="slideshow-slide active">
                <img src="${photoUrl}" alt="Фото">
            </div>
        `;
        this.updateSlideshowControls();
    }

    closeSlideshow() {
        const modal = document.getElementById('slideshowModal');
        modal.classList.add('hidden');
    }

    async editProfile(profileId) {
        const profile = this.profiles.find(p => p.id === profileId);
        if (profile) {
            this.currentEditId = profileId;
            this.openProfileModal(profile);
        }
    }

    async deleteProfile(profileId) {
        if (confirm('Вы уверены, что хотите удалить этот профиль?')) {
            try {
                Loading.show();
                await api.deleteProfile(profileId);
                await this.loadProfiles();
                Toast.show('Профиль успешно удален', 'success');
            } catch (error) {
                Toast.show('Ошибка удаления профиля: ' + error.message, 'error');
            } finally {
                Loading.hide();
            }
        }
    }

    openProfileModal(profile = null) {
        const modal = document.getElementById('profileModal');
        const modalTitle = document.getElementById('modalTitle');
        const locationSelect = document.getElementById('locationSelect');
        const photoUploadDiv = document.getElementById('profilePhotoUpload');
        
        if (locationSelect && this.locations.length > 0) {
            locationSelect.innerHTML = '<option value="">Не указано</option>' +
                this.locations.map(loc => `<option value="${loc.id}">${Utils.escapeHtml(loc.name)}</option>`).join('');
        }
        
        if (!profile && photoUploadDiv) {
            photoUploadDiv.innerHTML = `
                <div class="form-group">
                    <label for="profilePhotos">Фотографии профиля</label>
                    <input type="file" id="profilePhotos" multiple accept="image/*">
                    <small>Можно выбрать несколько фото (первое будет аватаром)</small>
                    <div id="profilePhotoPreview" class="photo-preview-grid"></div>
                </div>
            `;
            const photoInput = document.getElementById('profilePhotos');
            if (photoInput) {
                photoInput.onchange = () => this.previewProfilePhotos();
            }
        }
        
        const linksContainer = document.getElementById('linksContainer');
        if (linksContainer) {
            linksContainer.innerHTML = `
                <div class="links-header">
                    <h4>Ссылки на соцсети</h4>
                    <button type="button" class="btn-add-link" id="addLinkBtn">+ Добавить ссылку</button>
                </div>
                <div id="linksList"></div>
            `;
            const addBtn = document.getElementById('addLinkBtn');
            if (addBtn) {
                addBtn.addEventListener('click', () => this.addLinkField());
            }
        }
        
        if (profile) {
            modalTitle.textContent = 'Редактировать профиль';
            document.getElementById('firstName').value = profile.first_name || '';
            document.getElementById('middleName').value = profile.middle_name || '';
            document.getElementById('lastName').value = profile.last_name || '';
            document.getElementById('sex').value = profile.sex || 'male';
            document.getElementById('birthYear').value = profile.birth_year || '';
            document.getElementById('birthMonth').value = profile.birth_month || '';
            document.getElementById('birthDay').value = profile.birth_day || '';
            if (locationSelect && profile.current_location_id) {
                locationSelect.value = profile.current_location_id;
            }
            
            if (profile.links && profile.links.length > 0) {
                profile.links.forEach(link => this.addLinkField(link));
            }
        } else {
            modalTitle.textContent = 'Добавить профиль';
            const form = document.getElementById('profileForm');
            if (form) form.reset();
            const sexSelect = document.getElementById('sex');
            if (sexSelect) sexSelect.value = 'male';
            if (locationSelect) locationSelect.value = '';
        }
        
        modal.classList.remove('hidden');
    }

    addLinkField(existingLink = null) {
        const linksList = document.getElementById('linksList');
        if (!linksList) return;
        
        const linkDiv = document.createElement('div');
        linkDiv.className = 'link-item';
        linkDiv.innerHTML = `
            <select class="link-platform">
                <option value="">Выберите платформу</option>
                ${this.platforms.map(p => `<option value="${p.id}" ${existingLink && existingLink.platform_id === p.id ? 'selected' : ''}>${Utils.escapeHtml(p.name)}</option>`).join('')}
            </select>
            <input type="url" class="link-url" placeholder="https://..." value="${existingLink ? Utils.escapeHtml(existingLink.url) : ''}">
            <button type="button" class="btn-remove-link">✖</button>
        `;
        
        const removeBtn = linkDiv.querySelector('.btn-remove-link');
        removeBtn.addEventListener('click', () => linkDiv.remove());
        linksList.appendChild(linkDiv);
    }

    previewProfilePhotos() {
        const fileInput = document.getElementById('profilePhotos');
        const previewGrid = document.getElementById('profilePhotoPreview');
        if (!previewGrid) return;
        
        previewGrid.innerHTML = '';
        if (fileInput.files) {
            Array.from(fileInput.files).forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const previewDiv = document.createElement('div');
                    previewDiv.className = 'photo-preview-item';
                    previewDiv.innerHTML = `
                        <img src="${e.target.result}" alt="Preview ${index + 1}">
                        <span class="preview-name">${file.name.substring(0, 20)}</span>
                    `;
                    previewGrid.appendChild(previewDiv);
                };
                reader.readAsDataURL(file);
            });
        }
    }

    async saveProfile(profileData, linksData = null, photoFiles = null) {
        try {
            Loading.show();
            
            let profile;
            if (this.currentEditId) {
                profile = await api.updateProfile(this.currentEditId, profileData);
                Toast.show('Профиль успешно обновлен', 'success');
            } else {
                profile = await api.createProfile(profileData);
                Toast.show('Профиль успешно создан', 'success');
                
                if (photoFiles && photoFiles.length > 0) {
                    await api.uploadPhotos(profile.id, photoFiles);
                    Toast.show(`Загружено ${photoFiles.length} фото`, 'success');
                }
            }
            
            if (linksData && linksData.length > 0) {
                for (const link of linksData) {
                    if (link.url && link.platform_id) {
                        await api.createLink({
                            url: link.url,
                            platform_id: link.platform_id,
                            profile_id: profile.id
                        });
                    }
                }
            }
            
            await this.loadProfiles();
            this.closeProfileModal();
            this.currentEditId = null;
        } catch (error) {
            Toast.show('Ошибка сохранения профиля: ' + error.message, 'error');
        } finally {
            Loading.hide();
        }
    }

    closeProfileModal() {
        const modal = document.getElementById('profileModal');
        if (modal) modal.classList.add('hidden');
        const form = document.getElementById('profileForm');
        if (form) form.reset();
    }

    attachEvents() {
        document.getElementById('addProfileBtn')?.addEventListener('click', () => this.openProfileModal());
        document.querySelector('#profileModal .close-btn')?.addEventListener('click', () => this.closeProfileModal());
        document.getElementById('cancelBtn')?.addEventListener('click', () => this.closeProfileModal());
        
        document.getElementById('addCountryBtn')?.addEventListener('click', () => this.openCountryModal());
        document.getElementById('addRegionBtn')?.addEventListener('click', () => this.openRegionModal());
        document.getElementById('addLocationBtn')?.addEventListener('click', () => this.openLocationModal());
        document.getElementById('addPlatformBtn')?.addEventListener('click', () => this.openPlatformModal());
        
        document.getElementById('slideshowClose')?.addEventListener('click', () => this.closeSlideshow());
        
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('slideshowModal');
            if (modal && !modal.classList.contains('hidden')) {
                if (e.key === 'ArrowLeft') this.prevPhoto();
                if (e.key === 'ArrowRight') this.nextPhoto();
                if (e.key === 'Escape') this.closeSlideshow();
            }
            if (e.key === 'Escape') {
                this.closeProfileModal();
            }
        });
        
        document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const profileData = {
                first_name: document.getElementById('firstName').value || null,
                middle_name: document.getElementById('middleName').value || null,
                last_name: document.getElementById('lastName').value || null,
                sex: document.getElementById('sex').value,
                birth_year: parseInt(document.getElementById('birthYear').value) || null,
                birth_month: parseInt(document.getElementById('birthMonth').value) || null,
                birth_day: parseInt(document.getElementById('birthDay').value) || null,
                current_location_id: parseInt(document.getElementById('locationSelect').value) || null,
            };
            
            const links = [];
            document.querySelectorAll('.link-item').forEach(item => {
                const url = item.querySelector('.link-url')?.value;
                const platformId = item.querySelector('.link-platform')?.value;
                if (url && platformId) {
                    links.push({ url, platform_id: parseInt(platformId) });
                }
            });
            
            const photoInput = document.getElementById('profilePhotos');
            const photoFiles = photoInput ? photoInput.files : null;
            
            await this.saveProfile(profileData, links, photoFiles);
        });
        
        document.getElementById('countryForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.createCountry({ name: document.getElementById('countryName').value });
        });
        
        document.getElementById('regionForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.createRegion({
                name: document.getElementById('regionName').value,
                country_id: parseInt(document.getElementById('regionCountry').value) || null
            });
        });
        
        document.getElementById('locationForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.createLocation({
                name: document.getElementById('locationName').value,
                region_id: parseInt(document.getElementById('locationRegion').value) || null,
                latitude: parseFloat(document.getElementById('locationLat').value) || null,
                longitude: parseFloat(document.getElementById('locationLng').value) || null,
            });
        });
        
        document.getElementById('platformForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.createPlatform({
                name: document.getElementById('platformName').value,
                base_url: document.getElementById('platformUrl').value,
            });
        });
    }

    async createCountry(data) {
        try {
            const response = await fetch('http://localhost:8000/api/v1/countries/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                Toast.show('Страна создана', 'success');
                await this.loadCountries();
                this.closeCountryModal();
            }
        } catch (error) {
            Toast.show('Ошибка: ' + error.message, 'error');
        }
    }

    async createRegion(data) {
        try {
            const response = await fetch('http://localhost:8000/api/v1/regions/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                Toast.show('Регион создан', 'success');
                await this.loadRegions();
                this.closeRegionModal();
            }
        } catch (error) {
            Toast.show('Ошибка: ' + error.message, 'error');
        }
    }

    async createLocation(data) {
        try {
            const response = await fetch('http://localhost:8000/api/v1/locations/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                Toast.show('Локация создана', 'success');
                await this.loadLocations();
                this.closeLocationModal();
            }
        } catch (error) {
            Toast.show('Ошибка: ' + error.message, 'error');
        }
    }

    async createPlatform(data) {
        try {
            const response = await fetch('http://localhost:8000/api/v1/platforms/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                Toast.show('Платформа создана', 'success');
                await this.loadPlatforms();
                this.closePlatformModal();
            }
        } catch (error) {
            Toast.show('Ошибка: ' + error.message, 'error');
        }
    }

    openCountryModal() { document.getElementById('countryModal')?.classList.remove('hidden'); }
    closeCountryModal() { document.getElementById('countryModal')?.classList.add('hidden'); }
    openRegionModal() { document.getElementById('regionModal')?.classList.remove('hidden'); }
    closeRegionModal() { document.getElementById('regionModal')?.classList.add('hidden'); }
    openLocationModal() { document.getElementById('locationModal')?.classList.remove('hidden'); }
    closeLocationModal() { document.getElementById('locationModal')?.classList.add('hidden'); }
    openPlatformModal() { document.getElementById('platformModal')?.classList.remove('hidden'); }
    closePlatformModal() { document.getElementById('platformModal')?.classList.add('hidden'); }
}

window.profilesPage = new ProfilesPage();

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing profiles page...');
    window.profilesPage.init();
});