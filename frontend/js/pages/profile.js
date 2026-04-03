class ProfilePage {
    constructor() {
        this.profile = null;
        this.photos = [];
        this.locations = [];
        this.platforms = [];
        this.currentEditId = null;
    }

    async init() {
        const urlParams = new URLSearchParams(window.location.search);
        let profileId = urlParams.get('id');
        
        // Если параметра id нет, пытаемся получить из path
        if (!profileId) {
            const pathParts = window.location.pathname.split('/');
            profileId = pathParts[pathParts.length - 1];
        }
        
        if (!profileId || isNaN(parseInt(profileId))) {
            Toast.show('Профиль не найден', 'error');
            setTimeout(() => {
                window.location.href = '/profiles';
            }, 1500);
            return;
        }
        
        await Promise.all([
            this.loadLocations(),
            this.loadPlatforms()
        ]);
        await this.loadProfile(parseInt(profileId));
        this.render();
        this.attachEvents();
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

    async loadProfile(profileId) {
        try {
            Loading.show();
            this.profile = await api.getProfile(profileId);
            this.photos = await api.getPhotos(profileId);
            this.render();
        } catch (error) {
            console.error('Error loading profile:', error);
            Loading.showError('Ошибка загрузки профиля: ' + error.message);
            setTimeout(() => {
                window.location.href = '/profiles';
            }, 2000);
        } finally {
            Loading.hide();
        }
    }

    render() {
        const fullName = Utils.getFullName(this.profile);
        const birthDate = Utils.formatBirthDate(this.profile);
        const avatarHtml = this.getAvatarHtml();
        
        document.getElementById('profileName').textContent = fullName;
        document.getElementById('profileAvatar').innerHTML = avatarHtml;
        
        document.getElementById('profileGender').innerHTML = Utils.getGenderIcon(this.profile.sex);
        
        if (birthDate) {
            document.getElementById('profileBirthDate').innerHTML = `<i class="far fa-calendar-alt"></i> ${birthDate}`;
        } else {
            document.getElementById('profileBirthDate').style.display = 'none';
        }
        
        if (this.profile.current_location) {
            const locationName = this.profile.current_location.name;
            const regionName = this.profile.current_location.region?.name || '';
            const countryName = this.profile.current_location.region?.country?.name || '';
            const fullLocation = [locationName, regionName, countryName].filter(l => l).join(', ');
            document.getElementById('profileLocation').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${Utils.escapeHtml(fullLocation)}`;
        } else {
            document.getElementById('profileLocation').style.display = 'none';
        }
        
        this.renderLinks();
        this.renderPhotos();
        
        document.getElementById('photosCount').textContent = this.photos.length || 0;
        document.getElementById('linksCount').textContent = this.profile.links?.length || 0;
    }

    getAvatarHtml() {
        if (this.photos && this.photos.length > 0) {
            const avatarPhoto = this.photos.find(p => p.is_avatar) || this.photos[0];
            return `<img src="${avatarPhoto.url}" alt="${Utils.escapeHtml(Utils.getFullName(this.profile))}">`;
        }
        
        const initials = Utils.getAvatarInitials(Utils.getFullName(this.profile));
        return `<div class="avatar-placeholder-large">${initials}</div>`;
    }


    renderLinks() {
        const container = document.getElementById('socialLinksList');
        
        if (!this.profile.links || this.profile.links.length === 0) {
            container.innerHTML = '<p style="color: #8e8e8e;">Нет добавленных ссылок</p>';
            return;
        }
        
        container.innerHTML = this.profile.links.map(link => `
            <a href="${Utils.escapeHtml(link.url)}" target="_blank" class="social-link-item">
                <span>🔗</span>
                <span>${Utils.escapeHtml(link.platform.name)}</span>
                <span style="margin-left: auto;">→</span>
            </a>
        `).join('');
    }

    renderPhotos() {
        const container = document.getElementById('photosGrid');
        
        if (!this.photos || this.photos.length === 0) {
            container.innerHTML = '<p style="color: #8e8e8e; text-align: center; grid-column: 1/-1;">Нет добавленных фотографий</p>';
            return;
        }
        
        container.innerHTML = this.photos.map(photo => `
            <div class="photo-item">
                <img src="${Utils.escapeHtml(photo.url)}" alt="Фото" loading="lazy">
            </div>
        `).join('');
    }

    openEditModal() {
        const modal = document.getElementById('profileModal');
        const modalTitle = document.getElementById('modalTitle');
        const locationSelect = document.getElementById('locationSelect');
        
        if (locationSelect && this.locations.length > 0) {
            locationSelect.innerHTML = '<option value="">Не указано</option>' +
                this.locations.map(loc => `<option value="${loc.id}">${Utils.escapeHtml(loc.name)}</option>`).join('');
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
        
        modalTitle.textContent = 'Редактировать профиль';
        document.getElementById('firstName').value = this.profile.first_name || '';
        document.getElementById('middleName').value = this.profile.middle_name || '';
        document.getElementById('lastName').value = this.profile.last_name || '';
        document.getElementById('sex').value = this.profile.sex || 'male';
        document.getElementById('birthYear').value = this.profile.birth_year || '';
        document.getElementById('birthMonth').value = this.profile.birth_month || '';
        document.getElementById('birthDay').value = this.profile.birth_day || '';
        if (locationSelect && this.profile.current_location_id) {
            locationSelect.value = this.profile.current_location_id;
        }
        
        if (this.profile.links && this.profile.links.length > 0) {
            this.profile.links.forEach(link => this.addLinkField(link));
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

    closeModal() {
        const modal = document.getElementById('profileModal');
        if (modal) modal.classList.add('hidden');
    }

    async saveProfile(profileData, linksData = null) {
        try {
            Loading.show();
            
            await api.updateProfile(this.profile.id, profileData);
            
            if (linksData && linksData.length > 0) {
                for (const link of linksData) {
                    if (link.url && link.platform_id) {
                        await api.createLink({
                            url: link.url,
                            platform_id: link.platform_id,
                            profile_id: this.profile.id
                        });
                    }
                }
            }
            
            Toast.show('Профиль успешно обновлен', 'success');
            this.closeModal();
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            Toast.show('Ошибка сохранения профиля: ' + error.message, 'error');
        } finally {
            Loading.hide();
        }
    }

    async deleteProfile() {
        if (confirm('Вы уверены, что хотите удалить этот профиль?')) {
            try {
                Loading.show();
                await api.deleteProfile(this.profile.id);
                Toast.show('Профиль успешно удален', 'success');
                setTimeout(() => {
                    window.location.href = '/profiles';
                }, 1500);
            } catch (error) {
                Toast.show('Ошибка удаления профиля: ' + error.message, 'error');
            } finally {
                Loading.hide();
            }
        }
    }

    openPhotoUploadModal() {
        const modal = document.getElementById('photoUploadModal');
        const fileInput = document.getElementById('photoFiles');
        const previewGrid = document.getElementById('photoPreview');
        
        if (fileInput) fileInput.value = '';
        if (previewGrid) previewGrid.innerHTML = '';
        
        modal.classList.remove('hidden');
        
        // Add preview listener
        const photoFiles = document.getElementById('photoFiles');
        if (photoFiles) {
            photoFiles.onchange = () => this.previewPhotos();
        }
    }

    async reorderPhotos(photoIds) {
        try {
            Loading.show();
            const response = await fetch(`http://localhost:8000/api/v1/photos/reorder/${this.profile.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ photo_ids: photoIds })
            });
            
            if (response.ok) {
                await this.loadProfile(this.profile.id);
                this.render();
            }
        } catch (error) {
            console.error('Reorder error:', error);
        } finally {
            Loading.hide();
        }
    }

    previewPhotos() {
        const fileInput = document.getElementById('photoFiles');
        const previewGrid = document.getElementById('photoPreview');
        
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

    closePhotoUploadModal() {
        const modal = document.getElementById('photoUploadModal');
        modal.classList.add('hidden');
        const fileInput = document.getElementById('photoFiles');
        if (fileInput) fileInput.value = '';
        const previewGrid = document.getElementById('photoPreview');
        if (previewGrid) previewGrid.innerHTML = '';
    }

    async uploadPhotos() {
        const fileInput = document.getElementById('photoFiles');
        const files = fileInput.files;
        
        if (!files || files.length === 0) {
            Toast.show('Выберите фотографии для загрузки', 'error');
            return;
        }
        
        try {
            Loading.show();
            
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }
            formData.append('profile_id', this.profile.id);
            
            const response = await fetch('http://localhost:8000/api/v1/photos/multiple/', {
                method: 'POST',
                body: formData,
            });
            
            if (response.ok) {
                Toast.show(`Загружено ${files.length} фото`, 'success');
                this.closePhotoUploadModal();
                await this.loadProfile(this.profile.id);
                this.render();
            } else {
                const error = await response.json();
                Toast.show('Ошибка: ' + (error.detail || 'Не удалось загрузить фото'), 'error');
            }
        } catch (error) {
            Toast.show('Ошибка: ' + error.message, 'error');
        } finally {
            Loading.hide();
        }
    }
    
    async setAsAvatar(photoId) {
        try {
            Loading.show();
            await api.setAvatar(this.profile.id, photoId);
            Toast.show('Фото установлено как аватар', 'success');
            await this.loadProfile(this.profile.id);
            this.render();
        } catch (error) {
            Toast.show('Ошибка: ' + error.message, 'error');
        } finally {
            Loading.hide();
        }
    }

    async deletePhoto(photoId) {
        if (confirm('Вы уверены, что хотите удалить это фото?')) {
            try {
                Loading.show();
                await api.deletePhoto(photoId);
                Toast.show('Фото удалено', 'success');
                await this.loadProfile(this.profile.id);
                this.render();
            } catch (error) {
                Toast.show('Ошибка: ' + error.message, 'error');
            } finally {
                Loading.hide();
            }
        }
    }

    openSlideshow(photos, startIndex = 0) {
        const modal = document.getElementById('slideshowModal');
        const slideshowImages = document.getElementById('slideshowImages');
        const slideshowAuthor = document.getElementById('slideshowAuthor');
        
        this.slideshowPhotos = photos;
        this.currentSlideIndex = startIndex;
        
        slideshowImages.innerHTML = photos.map((photo, index) => `
            <div class="slideshow-slide ${index === startIndex ? 'active' : ''}" data-index="${index}">
                <img src="${photo.url}" alt="${photo.title || 'Фото'}">
            </div>
        `).join('');
        
        const fullName = Utils.getFullName(this.profile);
        const avatarPhoto = this.photos.find(p => p.is_avatar) || this.photos[0];
        const avatarHtml = avatarPhoto 
            ? `<img src="${avatarPhoto.url}" alt="${fullName}">`
            : `<div class="avatar-placeholder">${Utils.getAvatarInitials(fullName)}</div>`;
        
        slideshowAuthor.innerHTML = `
            <div class="slideshow-author">
                <div class="slideshow-avatar">
                    ${avatarHtml}
                </div>
                <div class="slideshow-name">${Utils.escapeHtml(fullName)}</div>
            </div>
        `;
        
        modal.classList.remove('hidden');
        this.updateSlideshowControls();
    }


    updateSlideshowControls() {
        const prevBtn = document.getElementById('slideshowPrev');
        const nextBtn = document.getElementById('slideshowNext');
        const counter = document.getElementById('slideshowCounter');
        
        if (prevBtn) {
            prevBtn.style.display = this.currentSlideIndex === 0 ? 'none' : 'flex';
        }
        if (nextBtn) {
            nextBtn.style.display = this.currentSlideIndex === this.slideshowPhotos.length - 1 ? 'none' : 'flex';
        }
        if (counter) {
            counter.textContent = `${this.currentSlideIndex + 1} / ${this.slideshowPhotos.length}`;
        }
    }

    nextSlide() {
        if (this.currentSlideIndex < this.slideshowPhotos.length - 1) {
            const slides = document.querySelectorAll('.slideshow-slide');
            slides[this.currentSlideIndex].classList.remove('active');
            this.currentSlideIndex++;
            slides[this.currentSlideIndex].classList.add('active');
            this.updateSlideshowControls();
        }
    }

    prevSlide() {
        if (this.currentSlideIndex > 0) {
            const slides = document.querySelectorAll('.slideshow-slide');
            slides[this.currentSlideIndex].classList.remove('active');
            this.currentSlideIndex--;
            slides[this.currentSlideIndex].classList.add('active');
            this.updateSlideshowControls();
        }
    }

    closeSlideshow() {
        const modal = document.getElementById('slideshowModal');
        modal.classList.add('hidden');
    }

    renderPhotos() {
        const container = document.getElementById('photosGrid');
        
        if (!this.photos || this.photos.length === 0) {
            container.innerHTML = '<p style="color: #8e8e8e; text-align: center; grid-column: 1/-1;">Нет добавленных фотографий</p>';
            return;
        }
        
        container.innerHTML = this.photos.map(photo => `
            <div class="photo-item" data-photo-id="${photo.id}" data-photo-url="${photo.url}">
                <img src="${Utils.escapeHtml(photo.url)}" alt="${photo.title || 'Фото'}" loading="lazy">
                <div class="photo-overlay">
                    <button class="photo-action star" data-action="avatar" data-photo-id="${photo.id}" title="Сделать аватаром">⭐</button>
                    <button class="photo-action delete" data-action="delete" data-photo-id="${photo.id}" title="Удалить">✖</button>
                </div>
                ${photo.is_avatar ? '<div class="avatar-badge">👑 Аватар</div>' : ''}
            </div>
        `).join('');
        
        // Add click handlers for photos (slideshow)
        document.querySelectorAll('.photo-item').forEach((item, index) => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.photo-action')) return;
                this.openSlideshow(this.photos, index, true);
            });
        });
        
        // Add action handlers
        document.querySelectorAll('[data-action="avatar"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const photoId = parseInt(btn.dataset.photoId);
                this.setAsAvatar(photoId);
            });
        });
        
        document.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const photoId = parseInt(btn.dataset.photoId);
                this.deletePhoto(photoId);
            });
        });
    }

    attachEvents() {
        document.getElementById('editProfileBtn')?.addEventListener('click', () => this.openEditModal());
        document.getElementById('deleteProfileBtn')?.addEventListener('click', () => this.deleteProfile());
        
        document.querySelector('#profileModal .close-btn')?.addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn')?.addEventListener('click', () => this.closeModal());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Avatar click for slideshow
        const avatarElement = document.querySelector('.profile-avatar-large');
        if (avatarElement) {
            avatarElement.addEventListener('click', () => {
                if (this.photos && this.photos.length > 0) {
                    this.openSlideshow(this.photos, 0);
                } else {
                    Toast.show('Нет фотографий для показа', 'error');
                }
            });
        }
        
        document.getElementById('profileModal')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('profileModal')) {
                this.closeModal();
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
            const linkItems = document.querySelectorAll('.link-item');
            linkItems.forEach(item => {
                const url = item.querySelector('.link-url')?.value;
                const platformId = item.querySelector('.link-platform')?.value;
                if (url && platformId) {
                    links.push({ url, platform_id: parseInt(platformId) });
                }
            });
            
            await this.saveProfile(profileData, links);
        });

        document.getElementById('addPhotoBtn')?.addEventListener('click', () => this.openPhotoUploadModal());
        document.getElementById('photoUploadCancel')?.addEventListener('click', () => this.closePhotoUploadModal());
        document.getElementById('photoUploadSubmit')?.addEventListener('click', () => this.uploadPhotos());
        document.getElementById('photoUploadClose')?.addEventListener('click', () => this.closePhotoUploadModal());
        
        // Slideshow events
        document.getElementById('slideshowPrev')?.addEventListener('click', () => this.prevSlide());
        document.getElementById('slideshowNext')?.addEventListener('click', () => this.nextSlide());
        document.getElementById('slideshowClose')?.addEventListener('click', () => this.closeSlideshow());
        
        // Keyboard navigation for slideshow
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('slideshowModal');
            if (!modal.classList.contains('hidden')) {
                if (e.key === 'ArrowLeft') this.prevSlide();
                if (e.key === 'ArrowRight') this.nextSlide();
                if (e.key === 'Escape') this.closeSlideshow();
            }
        });
    }
}

const profilePage = new ProfilePage();