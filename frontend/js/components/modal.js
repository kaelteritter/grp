import { createProfile, updateProfile } from '../api/profiles.js';
import { renderProfilesList } from './profile_list.js';
import { showNotification } from './notifications.js';

let createModalInstance = null;
let editModalInstance = null;

// Рендеринг модального окна для создания
export async function renderModal() {
    if (createModalInstance) {
        return createModalInstance;
    }
    
    const modal = createModalElement('Добавить профиль', null);
    document.body.appendChild(modal.element);
    
    const closeModal = () => {
        modal.element.style.display = 'none';
    };
    
    modal.close = closeModal;
    
    modal.element.querySelector('.close').onclick = closeModal;
    modal.element.querySelector('#cancelBtn').onclick = closeModal;
    
    window.onclick = (event) => {
        if (event.target === modal.element) {
            closeModal();
        }
    };
    
    modal.element.querySelector('#profileForm').onsubmit = async (event) => {
        event.preventDefault();
        const formData = getFormData();
        
        if (!formData.first_name && !formData.last_name) {
            showNotification('Укажите хотя бы имя или фамилию', 'error');
            return;
        }
        
        const submitBtn = modal.element.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Создание...';
        submitBtn.disabled = true;
        
        try {
            await createProfile(formData);
            showNotification('Профиль успешно создан!', 'success');
            closeModal();
            resetForm(modal.element);
            await renderProfilesList('profileList');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    };
    
    createModalInstance = {
        element: modal.element,
        show: () => {
            modal.element.style.display = 'block';
            resetForm(modal.element);
        },
        hide: closeModal
    };
    
    return createModalInstance;
}

// Рендеринг модального окна для редактирования
export async function renderEditModal(profile) {
    if (editModalInstance) {
        // Обновляем данные в существующем модальном окне
        fillFormData(editModalInstance.element, profile);
        return editModalInstance;
    }
    
    const modal = createModalElement('Редактировать профиль', profile);
    document.body.appendChild(modal.element);
    
    const closeModal = () => {
        modal.element.style.display = 'none';
    };
    
    modal.close = closeModal;
    
    modal.element.querySelector('.close').onclick = closeModal;
    modal.element.querySelector('#cancelBtn').onclick = closeModal;
    
    window.onclick = (event) => {
        if (event.target === modal.element) {
            closeModal();
        }
    };
    
    modal.element.querySelector('#profileForm').onsubmit = async (event) => {
        event.preventDefault();
        const formData = getFormData();
        
        const submitBtn = modal.element.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Сохранение...';
        submitBtn.disabled = true;
        
        try {
            await updateProfile(profile.id, formData);
            showNotification('Профиль успешно обновлен!', 'success');
            closeModal();
            await renderProfilesList('profileList');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    };
    
    editModalInstance = {
        element: modal.element,
        show: () => {
            fillFormData(modal.element, profile);
            modal.element.style.display = 'block';
        },
        hide: closeModal
    };
    
    return editModalInstance;
}

// Создание DOM элемента модального окна
function createModalElement(title, profile) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'profileModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <span class="close">&times;</span>
            </div>
            <form id="profileForm">
                <div class="form-group">
                    <label for="last_name">Фамилия</label>
                    <input type="text" id="last_name" name="last_name" maxlength="255">
                </div>
                
                <div class="form-group">
                    <label for="first_name">Имя</label>
                    <input type="text" id="first_name" name="first_name" maxlength="255">
                </div>
                
                <div class="form-group">
                    <label for="middle_name">Отчество</label>
                    <input type="text" id="middle_name" name="middle_name" maxlength="255">
                </div>
                
                <div class="form-group">
                    <label for="sex">Пол</label>
                    <select id="sex" name="sex">
                        <option value="male">Мужской</option>
                        <option value="female">Женский</option>
                    </select>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="birth_year">Год рождения</label>
                        <input type="number" id="birth_year" name="birth_year" min="1900" max="2026">
                    </div>
                    
                    <div class="form-group">
                        <label for="birth_month">Месяц рождения</label>
                        <input type="number" id="birth_month" name="birth_month" min="1" max="12">
                    </div>
                    
                    <div class="form-group">
                        <label for="birth_day">День рождения</label>
                        <input type="number" id="birth_day" name="birth_day" min="1" max="31">
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" id="cancelBtn" class="btn-secondary">Отмена</button>
                    <button type="submit" class="btn-primary">${profile ? 'Сохранить' : 'Создать'}</button>
                </div>
            </form>
        </div>
    `;
    
    return { element: modal };
}

// Получение данных из формы
function getFormData() {
    return {
        first_name: document.getElementById('first_name').value || null,
        middle_name: document.getElementById('middle_name').value || null,
        last_name: document.getElementById('last_name').value || null,
        sex: document.getElementById('sex').value,
        birth_year: parseInt(document.getElementById('birth_year').value) || null,
        birth_month: parseInt(document.getElementById('birth_month').value) || null,
        birth_day: parseInt(document.getElementById('birth_day').value) || null
    };
}

// Заполнение формы данными профиля
function fillFormData(modalElement, profile) {
    modalElement.querySelector('#last_name').value = profile.last_name || '';
    modalElement.querySelector('#first_name').value = profile.first_name || '';
    modalElement.querySelector('#middle_name').value = profile.middle_name || '';
    modalElement.querySelector('#sex').value = profile.sex;
    modalElement.querySelector('#birth_year').value = profile.birth_year || '';
    modalElement.querySelector('#birth_month').value = profile.birth_month || '';
    modalElement.querySelector('#birth_day').value = profile.birth_day || '';
}

// Сброс формы
function resetForm(modalElement) {
    modalElement.querySelector('#profileForm').reset();
}