class Modal {
    static open(profile = null, locations = [], pageInstance = null, platforms = []) {
        const modal = document.getElementById('profileModal');
        const modalTitle = document.getElementById('modalTitle');
        const locationSelect = document.getElementById('locationSelect');
        const linksContainer = document.getElementById('linksContainer');
        
        if (!modal) return;
        
        // Populate locations dropdown
        if (locationSelect && locations.length > 0) {
            locationSelect.innerHTML = '<option value="">Не указано</option>' +
                locations.map(loc => `<option value="${loc.id}">${Utils.escapeHtml(loc.name)}</option>`).join('');
        }
        
        // Populate platforms for links
        if (linksContainer && platforms.length > 0) {
            this.renderLinksSection(platforms);
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
            
            // Load existing links if editing
            if (profile.links && profile.links.length > 0 && linksContainer) {
                this.renderExistingLinks(profile.links, platforms);
            }
        } else {
            modalTitle.textContent = 'Добавить профиль';
            const form = document.getElementById('profileForm');
            if (form) form.reset();
            const sexSelect = document.getElementById('sex');
            if (sexSelect) sexSelect.value = 'male';
            if (locationSelect) locationSelect.value = '';
            
            // Clear links section
            if (linksContainer) {
                linksContainer.innerHTML = `
                    <div class="links-header">
                        <h4>Ссылки на соцсети</h4>
                        <button type="button" class="btn-add-link" id="addLinkBtn">+ Добавить ссылку</button>
                    </div>
                    <div id="linksList"></div>
                `;
                document.getElementById('addLinkBtn')?.addEventListener('click', () => this.addLinkField(platforms));
            }
        }
        
        modal.classList.remove('hidden');
    }

    static renderLinksSection(platforms) {
        const linksContainer = document.getElementById('linksContainer');
        if (!linksContainer) return;
        
        linksContainer.innerHTML = `
            <div class="links-header">
                <h4>Ссылки на соцсети</h4>
                <button type="button" class="btn-add-link" id="addLinkBtn">+ Добавить ссылку</button>
            </div>
            <div id="linksList"></div>
        `;
        
        document.getElementById('addLinkBtn')?.addEventListener('click', () => this.addLinkField(platforms));
        this.platformsCache = platforms;
    }

    static renderExistingLinks(links, platforms) {
        const linksList = document.getElementById('linksList');
        if (!linksList) return;
        
        linksList.innerHTML = '';
        links.forEach(link => {
            this.addLinkField(platforms, link);
        });
    }

    static addLinkField(platforms, existingLink = null) {
        const linksList = document.getElementById('linksList');
        if (!linksList) return;
        
        const linkDiv = document.createElement('div');
        linkDiv.className = 'link-item';
        linkDiv.innerHTML = `
            <select class="link-platform" ${existingLink ? 'disabled' : ''}>
                <option value="">Выберите платформу</option>
                ${platforms.map(p => `<option value="${p.id}" ${existingLink && existingLink.platform_id === p.id ? 'selected' : ''}>${Utils.escapeHtml(p.name)}</option>`).join('')}
            </select>
            <input type="url" class="link-url" placeholder="https://..." value="${existingLink ? Utils.escapeHtml(existingLink.url) : ''}" ${existingLink ? 'disabled' : ''}>
            ${!existingLink ? '<button type="button" class="btn-remove-link">✖</button>' : ''}
        `;
        
        if (!existingLink) {
            const removeBtn = linkDiv.querySelector('.btn-remove-link');
            removeBtn.addEventListener('click', () => linkDiv.remove());
        }
        
        linksList.appendChild(linkDiv);
    }

    static close() {
        const modal = document.getElementById('profileModal');
        if (modal) modal.classList.add('hidden');
        const form = document.getElementById('profileForm');
        if (form) form.reset();
    }
}