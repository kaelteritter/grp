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
        
        document.getElementById('profileFullName').textContent = fullName;
        document.getElementById('profileGender').innerHTML = `${Utils.getGenderIcon(this.profile.sex)} ${Utils.getGenderText(this.profile.sex)}`;
        
        if (birthDate) {
            document.getElementById('profileBirthDate').textContent = birthDate;
        } else {
            const birthDateRow = document.getElementById('birthDateRow');
            if (birthDateRow) birthDateRow.style.display = 'none';
        }
        
        if (this.profile.current_location) {
            document.getElementById('profileLocation').innerHTML = `📍 ${Utils.escapeHtml(this.profile.current_location.name)}`;
            if (this.profile.current_location.region) {
                document.getElementById('profileRegion').innerHTML = `🏞️ ${Utils.escapeHtml(this.profile.current_location.region.name)}`;
                if (this.profile.current_location.region.country) {
                    document.getElementById('profileCountry').innerHTML = `🌍 ${Utils.escapeHtml(this.profile.current_location.region.country.name)}`;
                }
            }
        } else {
            const locationSection = document.getElementById('locationSection');
            if (locationSection) locationSection.style.display = 'none';
        }
        
        this.renderLinks();
        this.renderPhotos();
        
        document.getElementById('photosCount').textContent = this.photos.length || 0;
        document.getElementById('linksCount').textContent = this.profile.links?.length || 0;
    }

    getAvatarHtml() {
        if (this.profile.photos && this.profile.photos.length > 0) {
            const avatarPhoto = this.profile.photos.find(p => p.is_avatar) || this.profile.photos[0];
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
    }
}

const profilePage = new ProfilePage();