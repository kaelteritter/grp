class ProfilesPage {
    constructor() {
        this.profiles = [];
        this.currentEditId = null;
        this.locations = [];
        this.regions = [];
        this.countries = [];
        this.platforms = [];
        this.isLoading = false;
    }

    async init() {
        await Promise.all([
            this.loadCountries(),
            this.loadRegions(),
            this.loadLocations(),
            this.loadPlatforms()
        ]);
        await this.loadProfiles();
        this.attachEvents();
    }

    async loadCountries() {
        try {
            const response = await fetch('http://localhost:8000/api/v1/countries/');
            if (response.ok) {
                this.countries = await response.json();
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
            }
        } catch (error) {
            console.error('Error loading platforms:', error);
        }
    }

    async loadProfiles() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            Loading.show();
            this.profiles = await api.getProfiles();
            console.log('Loaded profiles:', this.profiles.map(p => ({ 
                id: p.id, 
                name: Utils.getFullName(p), 
                photosCount: p.photos?.length || 0 
            })));
            this.render();
        } catch (error) {
            console.error('Error loading profiles:', error);
            Loading.showError('Ошибка загрузки профилей: ' + error.message);
        } finally {
            Loading.hide();
            this.isLoading = false;
        }
    }

    render() {
        const grid = document.getElementById('profilesGrid');
        
        if (!this.profiles || this.profiles.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <p>✨ Нет добавленных профилей</p>
                    <button class="btn-minimal primary" id="emptyAddBtn">Добавить первый профиль</button>
                </div>
            `;
            document.getElementById('emptyAddBtn')?.addEventListener('click', () => this.openProfileModal());
            return;
        }

        grid.innerHTML = this.profiles.map(profile => Card.render(profile)).join('');
        this.attachCardEvents();
    }

    // Slideshow for a single profile's photos
    openSlideshow(profile) {
        console.log('Opening slideshow for profile:', profile.id, 'Photos:', profile.photos);
        
        if (!profile.photos || profile.photos.length === 0) {
            Toast.show('У этого профиля нет фотографий', 'error');
            return;
        }
        
        const modal = document.getElementById('slideshowModal');
        const slideshowImages = document.getElementById('slideshowImages');
        const slideshowAuthor = document.getElementById('slideshowAuthor');
        const slideshowCounter = document.getElementById('slideshowCounter');
        
        this.currentProfile = profile;
        this.currentSlideshowPhotos = profile.photos;
        this.currentPhotoIndex = 0;
        
        // Render current photo
        slideshowImages.innerHTML = `
            <div class="slideshow-slide active">
                <img src="${this.currentSlideshowPhotos[0].url}" alt="${this.currentSlideshowPhotos[0].title || 'Фото'}">
            </div>
        `;
        
        // Render author info
        const fullName = Utils.getFullName(profile);
        const avatarPhoto = profile.photos.find(p => p.is_avatar) || profile.photos[0];
        const avatarHtml = avatarPhoto 
            ? `<img src="${avatarPhoto.url}" alt="${fullName}">`
            : `<div class="avatar-placeholder">${Utils.getAvatarInitials(fullName)}</div>`;
        
        slideshowAuthor.innerHTML = `
            <div class="slideshow-author" data-profile-id="${profile.id}">
                <div class="slideshow-avatar">
                    ${avatarHtml}
                </div>
                <div class="slideshow-name">${Utils.escapeHtml(fullName)}</div>
            </div>
        `;
        
        slideshowCounter.textContent = `1 / ${this.currentSlideshowPhotos.length}`;
        
        modal.classList.remove('hidden');
        this.updateSlideshowControls();
        
        // Attach click to author
        const authorDiv = document.querySelector('.slideshow-author');
        if (authorDiv) {
            authorDiv.onclick = (e) => {
                e.stopPropagation();
                const profileId = parseInt(authorDiv.dataset.profileId);
                window.location.href = `/profiles/${profileId}`;
            };
        }
    }

    updateSlideshowControls() {
        const prevPhoto = document.getElementById('slideshowPrev');
        const nextPhoto = document.getElementById('slideshowNext');
        const counter = document.getElementById('slideshowCounter');
        
        if (prevPhoto) {
            prevPhoto.style.display = this.currentPhotoIndex === 0 ? 'none' : 'flex';
            // Remove old listener and add new one
            const newPrev = prevPhoto.cloneNode(true);
            prevPhoto.parentNode.replaceChild(newPrev, prevPhoto);
            newPrev.onclick = () => this.prevPhoto();
        }
        if (nextPhoto) {
            nextPhoto.style.display = this.currentPhotoIndex === this.currentSlideshowPhotos.length - 1 ? 'none' : 'flex';
            const newNext = nextPhoto.cloneNode(true);
            nextPhoto.parentNode.replaceChild(newNext, nextPhoto);
            newNext.onclick = () => this.nextPhoto();
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
        
        slideshowImages.innerHTML = `
            <div class="slideshow-slide active">
                <img src="${currentPhoto.url}" alt="${currentPhoto.title || 'Фото'}">
            </div>
        `;
        
        this.updateSlideshowControls();
    }

    

    openGlobalSlideshow(startProfileId) {
        // Collect avatars from all profiles (first photo or is_avatar flag)
        this.avatars = [];
        this.profiles.forEach(profile => {
            if (profile.photos && profile.photos.length > 0) {
                const avatarPhoto = profile.photos.find(p => p.is_avatar) || profile.photos[0];
                this.avatars.push({
                    ...avatarPhoto,
                    profileId: profile.id,
                    profileName: Utils.getFullName(profile),
                    profileAvatar: avatarPhoto
                });
            }
        });
        
        if (this.avatars.length === 0) {
            Toast.show('Нет фотографий для показа', 'error');
            return;
        }
        
        // Find starting index
        let startIndex = this.avatars.findIndex(a => a.profileId === startProfileId);
        if (startIndex === -1) startIndex = 0;
        
        this.currentAvatarIndex = startIndex;
        this.openAvatarSlideshow();
    }

    openAvatarSlideshow() {
    const modal = document.getElementById('slideshowModal');
    const slideshowImages = document.getElementById('slideshowImages');
    const slideshowAuthor = document.getElementById('slideshowAuthor');
    const slideshowCounter = document.getElementById('slideshowCounter');
    
    const currentAvatar = this.avatars[this.currentAvatarIndex];
    
    // Render current photo
    slideshowImages.innerHTML = `
        <div class="slideshow-slide active">
            <img src="${currentAvatar.url}" alt="${currentAvatar.title || 'Avatar'}">
        </div>
    `;
    
    // Render author info with clickable avatar
    slideshowAuthor.innerHTML = `
        <div class="slideshow-author" data-profile-id="${currentAvatar.profileId}">
            <div class="slideshow-avatar">
                <img src="${currentAvatar.url}" alt="${currentAvatar.profileName}">
            </div>
            <div class="slideshow-name">${Utils.escapeHtml(currentAvatar.profileName)}</div>
        </div>
    `;
    
    slideshowCounter.textContent = `${this.currentAvatarIndex + 1} / ${this.avatars.length}`;
    
    modal.classList.remove('hidden');
    this.updateAvatarSlideshowControls();
    
    // Attach click to author
    const authorDiv = document.querySelector('.slideshow-author');
    if (authorDiv) {
        authorDiv.onclick = (e) => {
            e.stopPropagation();
            const profileId = parseInt(authorDiv.dataset.profileId);
            window.location.href = `/profiles/${profileId}`;
        };
    }
    }

    updateAvatarSlideshowControls() {
    const prevBtn = document.getElementById('slideshowPrev');
    const nextBtn = document.getElementById('slideshowNext');
    const counter = document.getElementById('slideshowCounter');
    
    if (prevBtn) {
        prevBtn.style.display = this.currentAvatarIndex === 0 ? 'none' : 'flex';
        const newPrev = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrev, prevBtn);
        newPrev.onclick = () => this.prevAvatar();
    }
    if (nextBtn) {
        nextBtn.style.display = this.currentAvatarIndex === this.avatars.length - 1 ? 'none' : 'flex';
        const newNext = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNext, nextBtn);
        newNext.onclick = () => this.nextAvatar();
    }
    if (counter) {
        counter.textContent = `${this.currentAvatarIndex + 1} / ${this.avatars.length}`;
        }
    }

    prevAvatar() {
        if (this.currentAvatarIndex > 0) {
            this.currentAvatarIndex--;
            this.updateAvatarSlide();
        }
    }

    nextAvatar() {
        if (this.currentAvatarIndex < this.avatars.length - 1) {
            this.currentAvatarIndex++;
            this.updateAvatarSlide();
        }
    }

    updateAvatarSlide() {
        const slideshowImages = document.getElementById('slideshowImages');
        const slideshowAuthor = document.getElementById('slideshowAuthor');
        const currentAvatar = this.avatars[this.currentAvatarIndex];
        
        slideshowImages.innerHTML = `
            <div class="slideshow-slide active">
                <img src="${currentAvatar.url}" alt="${currentAvatar.title || 'Avatar'}">
            </div>
        `;
        
        slideshowAuthor.innerHTML = `
            <div class="slideshow-author" data-profile-id="${currentAvatar.profileId}">
                <div class="slideshow-avatar">
                    <img src="${currentAvatar.url}" alt="${currentAvatar.profileName}">
                </div>
                <div class="slideshow-name">${Utils.escapeHtml(currentAvatar.profileName)}</div>
            </div>
        `;
        
        const authorDiv = document.querySelector('.slideshow-author');
        if (authorDiv) {
            authorDiv.onclick = (e) => {
                e.stopPropagation();
                const profileId = parseInt(authorDiv.dataset.profileId);
                window.location.href = `/profiles/${profileId}`;
            };
        }
        
        this.updateAvatarSlideshowControls();
    }



    updateGlobalSlideshowControls() {
        const prevPhoto = document.getElementById('slideshowPrev');
        const nextPhoto = document.getElementById('slideshowNext');
        const counter = document.getElementById('slideshowCounter');
        
        if (prevPhoto) {
            prevPhoto.style.display = this.currentGlobalPhotoIndex === 0 ? 'none' : 'flex';
            const newPrev = prevPhoto.cloneNode(true);
            prevPhoto.parentNode.replaceChild(newPrev, prevPhoto);
            newPrev.onclick = () => this.prevGlobalPhoto();
        }
        if (nextPhoto) {
            nextPhoto.style.display = this.currentGlobalPhotoIndex === this.allPhotos.length - 1 ? 'none' : 'flex';
            const newNext = nextPhoto.cloneNode(true);
            nextPhoto.parentNode.replaceChild(newNext, nextPhoto);
            newNext.onclick = () => this.nextGlobalPhoto();
        }
        if (counter) {
            counter.textContent = `${this.currentGlobalPhotoIndex + 1} / ${this.allPhotos.length}`;
        }
    }

    prevGlobalPhoto() {
        if (this.currentGlobalPhotoIndex > 0) {
            this.currentGlobalPhotoIndex--;
            this.updateGlobalSlideImage();
        }
    }

    nextGlobalPhoto() {
        if (this.currentGlobalPhotoIndex < this.allPhotos.length - 1) {
            this.currentGlobalPhotoIndex++;
            this.updateGlobalSlideImage();
        }
    }

    updateGlobalSlideImage() {
        const slideshowImages = document.getElementById('slideshowImages');
        const currentPhoto = this.allPhotos[this.currentGlobalPhotoIndex];
        const slideshowAuthor = document.getElementById('slideshowAuthor');
        
        slideshowImages.innerHTML = `
            <div class="slideshow-slide active">
                <img src="${currentPhoto.url}" alt="${currentPhoto.title || 'Фото'}">
            </div>
        `;
        
        // Update author info
        const avatarHtml = currentPhoto.profileAvatar
            ? `<img src="${currentPhoto.profileAvatar.url}" alt="${currentPhoto.profileName}">`
            : `<div class="avatar-placeholder">${Utils.getAvatarInitials(currentPhoto.profileName)}</div>`;
        
        slideshowAuthor.innerHTML = `
            <div class="slideshow-author" data-profile-id="${currentPhoto.profileId}">
                <div class="slideshow-avatar">
                    ${avatarHtml}
                </div>
                <div class="slideshow-name">${Utils.escapeHtml(currentPhoto.profileName)}</div>
            </div>
        `;
        
        const authorDiv = document.querySelector('.slideshow-author');
        if (authorDiv) {
            authorDiv.onclick = (e) => {
                e.stopPropagation();
                const profileId = parseInt(authorDiv.dataset.profileId);
                window.location.href = `/profiles/${profileId}`;
            };
        }
        
        this.updateGlobalSlideshowControls();
    }

    closeSlideshow() {
        const modal = document.getElementById('slideshowModal');
        modal.classList.add('hidden');
        this.avatars = null;
        this.currentAvatarIndex = 0;
    }
    
    attachCardEvents() {
        // Avatar click for global slideshow (avatars only)
        document.querySelectorAll('[data-avatar-click]').forEach(el => {
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
            
            newEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const profileId = parseInt(newEl.dataset.avatarClick);
                const hasPhotos = newEl.dataset.hasPhotos === 'true';
                
                if (!hasPhotos) {
                    Toast.show('У этого профиля нет фотографий', 'error');
                    return;
                }
                
                // Open global slideshow - avatars of all profiles
                this.openGlobalSlideshow(profileId);
            });
        });
        
        // Name click for profile page
        document.querySelectorAll('[data-name-click]').forEach(el => {
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
            
            newEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const profileId = parseInt(newEl.dataset.nameClick);
                window.location.href = `/profiles/${profileId}`;
            });
        });

        // Edit button
        document.querySelectorAll('[data-edit]').forEach(el => {
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
            
            newEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const profileId = parseInt(newEl.dataset.edit);
                this.editProfile(profileId);
            });
        });

        // Delete button
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
        
        // Add photo upload section for new profiles
        if (!profile && photoUploadDiv) {
            photoUploadDiv.innerHTML = `
                <div class="form-group">
                    <label for="profilePhotos">Фотографии профиля</label>
                    <input type="file" id="profilePhotos" multiple accept="image/*">
                    <small style="color: #8e8e8e; display: block; margin-top: 5px;">Можно выбрать несколько фото (первое будет аватаром)</small>
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

    // Country CRUD
    async createCountry(countryData) {
        try {
            Loading.show();
            const response = await fetch('http://localhost:8000/api/v1/countries/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(countryData)
            });
            
            if (response.ok) {
                Toast.show('Страна успешно создана', 'success');
                await this.loadCountries();
                this.closeCountryModal();
                await this.loadRegions();
            } else {
                const error = await response.json();
                Toast.show('Ошибка: ' + (error.detail || 'Не удалось создать страну'), 'error');
            }
        } catch (error) {
            Toast.show('Ошибка: ' + error.message, 'error');
        } finally {
            Loading.hide();
        }
    }

    async createRegion(regionData) {
        try {
            Loading.show();
            const response = await fetch('http://localhost:8000/api/v1/regions/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(regionData)
            });
            
            if (response.ok) {
                Toast.show('Регион успешно создан', 'success');
                await this.loadRegions();
                this.closeRegionModal();
            } else {
                const error = await response.json();
                Toast.show('Ошибка: ' + (error.detail || 'Не удалось создать регион'), 'error');
            }
        } catch (error) {
            Toast.show('Ошибка: ' + error.message, 'error');
        } finally {
            Loading.hide();
        }
    }

    async createLocation(locationData) {
        try {
            Loading.show();
            const response = await fetch('http://localhost:8000/api/v1/locations/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(locationData)
            });
            
            if (response.ok) {
                Toast.show('Локация успешно создана', 'success');
                await this.loadLocations();
                this.closeLocationModal();
            } else {
                const error = await response.json();
                Toast.show('Ошибка: ' + (error.detail || 'Не удалось создать локацию'), 'error');
            }
        } catch (error) {
            Toast.show('Ошибка: ' + error.message, 'error');
        } finally {
            Loading.hide();
        }
    }

    async createPlatform(platformData) {
        try {
            Loading.show();
            const response = await fetch('http://localhost:8000/api/v1/platforms/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(platformData)
            });
            
            if (response.ok) {
                Toast.show('Платформа успешно создана', 'success');
                await this.loadPlatforms();
                this.closePlatformModal();
            } else {
                const error = await response.json();
                Toast.show('Ошибка: ' + (error.detail || 'Не удалось создать платформу'), 'error');
            }
        } catch (error) {
            Toast.show('Ошибка: ' + error.message, 'error');
        } finally {
            Loading.hide();
        }
    }

    // Modal open/close methods
    openCountryModal() {
        document.getElementById('countryModal')?.classList.remove('hidden');
    }

    closeCountryModal() {
        document.getElementById('countryModal')?.classList.add('hidden');
        document.getElementById('countryForm')?.reset();
    }

    openRegionModal() {
        const countrySelect = document.getElementById('regionCountry');
        if (countrySelect && this.countries.length > 0) {
            countrySelect.innerHTML = '<option value="">Выберите страну</option>' +
                this.countries.map(c => `<option value="${c.id}">${Utils.escapeHtml(c.name)}</option>`).join('');
        }
        document.getElementById('regionModal')?.classList.remove('hidden');
    }

    closeRegionModal() {
        document.getElementById('regionModal')?.classList.add('hidden');
        document.getElementById('regionForm')?.reset();
    }

    openLocationModal() {
        const regionSelect = document.getElementById('locationRegion');
        if (regionSelect && this.regions.length > 0) {
            regionSelect.innerHTML = '<option value="">Выберите регион</option>' +
                this.regions.map(r => `<option value="${r.id}">${Utils.escapeHtml(r.name)}</option>`).join('');
        }
        document.getElementById('locationModal')?.classList.remove('hidden');
    }

    closeLocationModal() {
        document.getElementById('locationModal')?.classList.add('hidden');
        document.getElementById('locationForm')?.reset();
    }

    openPlatformModal() {
        document.getElementById('platformModal')?.classList.remove('hidden');
    }

    closePlatformModal() {
        document.getElementById('platformModal')?.classList.add('hidden');
        document.getElementById('platformForm')?.reset();
    }

    closeProfileModal() {
        const modal = document.getElementById('profileModal');
        if (modal) modal.classList.add('hidden');
        const form = document.getElementById('profileForm');
        if (form) form.reset();
    }

    attachEvents() {
        // Profile modal events
        document.getElementById('addProfileBtn')?.addEventListener('click', () => this.openProfileModal());
        document.querySelector('#profileModal .close-btn')?.addEventListener('click', () => this.closeProfileModal());
        document.getElementById('cancelBtn')?.addEventListener('click', () => this.closeProfileModal());
        
        // Country modal events
        document.getElementById('addCountryBtn')?.addEventListener('click', () => this.openCountryModal());
        document.querySelector('#countryModal .country-close')?.addEventListener('click', () => this.closeCountryModal());
        document.querySelector('#countryModal .country-cancel')?.addEventListener('click', () => this.closeCountryModal());
        
        // Region modal events
        document.getElementById('addRegionBtn')?.addEventListener('click', () => this.openRegionModal());
        document.querySelector('#regionModal .region-close')?.addEventListener('click', () => this.closeRegionModal());
        document.querySelector('#regionModal .region-cancel')?.addEventListener('click', () => this.closeRegionModal());
        
        // Location modal events
        document.getElementById('addLocationBtn')?.addEventListener('click', () => this.openLocationModal());
        document.querySelector('#locationModal .location-close')?.addEventListener('click', () => this.closeLocationModal());
        document.querySelector('#locationModal .location-cancel')?.addEventListener('click', () => this.closeLocationModal());
        
        // Platform modal events
        document.getElementById('addPlatformBtn')?.addEventListener('click', () => this.openPlatformModal());
        document.querySelector('#platformModal .platform-close')?.addEventListener('click', () => this.closePlatformModal());
        document.querySelector('#platformModal .platform-cancel')?.addEventListener('click', () => this.closePlatformModal());
        
        // Slideshow close events
        document.getElementById('slideshowClose')?.addEventListener('click', () => this.closeSlideshow());
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('slideshowModal');
            if (!modal.classList.contains('hidden')) {
                if (e.key === 'ArrowLeft') this.prevAvatar();
                if (e.key === 'ArrowRight') this.nextAvatar();
                if (e.key === 'Escape') this.closeSlideshow();
            }
        });
        
        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeProfileModal();
                this.closeCountryModal();
                this.closeRegionModal();
                this.closeLocationModal();
                this.closePlatformModal();
            }
        });
        
        // Close modal on outside click
        document.getElementById('profileModal')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('profileModal')) this.closeProfileModal();
        });
        document.getElementById('countryModal')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('countryModal')) this.closeCountryModal();
        });
        document.getElementById('regionModal')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('regionModal')) this.closeRegionModal();
        });
        document.getElementById('locationModal')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('locationModal')) this.closeLocationModal();
        });
        document.getElementById('platformModal')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('platformModal')) this.closePlatformModal();
        });
        
        // Profile form submit
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
            const linkItems = document.querySelectorAll('.link-item');
            linkItems.forEach(item => {
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
        
        // Country form submit
        document.getElementById('countryForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const countryData = {
                name: document.getElementById('countryName').value
            };
            await this.createCountry(countryData);
        });
        
        // Region form submit
        document.getElementById('regionForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const regionData = {
                name: document.getElementById('regionName').value,
                country_id: parseInt(document.getElementById('regionCountry').value) || null
            };
            await this.createRegion(regionData);
        });
        
        // Location form submit
        document.getElementById('locationForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const locationData = {
                name: document.getElementById('locationName').value,
                region_id: parseInt(document.getElementById('locationRegion').value) || null,
                latitude: parseFloat(document.getElementById('locationLat').value) || null,
                longitude: parseFloat(document.getElementById('locationLng').value) || null,
            };
            await this.createLocation(locationData);
        });
        
        // Platform form submit
        document.getElementById('platformForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const platformData = {
                name: document.getElementById('platformName').value,
                base_url: document.getElementById('platformUrl').value,
            };
            await this.createPlatform(platformData);
        });
    }
}

const profilesPage = new ProfilesPage();