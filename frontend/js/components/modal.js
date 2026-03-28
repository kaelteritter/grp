import { createProfile, updateProfile } from '../api/profiles.js';
import { renderProfilesList } from './profile_list.js';
import { showNotification } from './notifications.js';

let createModalInstance = null;
let editModalInstance = null;
let currentEditProfileId = null;

// Рендеринг модального окна для создания
export async function renderModal() {
    if (createModalInstance) {
        return createModalInstance;
    }
    
    const modal = createModalElement('Добавить профиль', 'create');
    document.body.appendChild(modal.element);
    
    const closeModal = () => {
        modal.element.style.display = 'none';
        resetForm(modal.element);
        currentEditProfileId = null;
    };
    
    modal.close = closeModal;
    
    modal.element.querySelector('.close').onclick = closeModal;
    modal.element.querySelector('#cancelBtn').onclick = closeModal;
    
    // Закрытие при клике вне окна
    modal.element.addEventListener('click', (event) => {
        if (event.target === modal.element) {
            closeModal();
        }
    });
    
    modal.element.querySelector('#profileForm').onsubmit = async (event) => {
        event.preventDefault();
        const formData = getFormData(modal.element);
        
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
            resetForm(modal.element);
            modal.element.style.display = 'block';
        },
        hide: closeModal
    };
    
    return createModalInstance;
}

// Рендеринг модального окна для редактирования
export async function renderEditModal(profile) {
    // Проверяем, что profile передан корректно
    if (!profile || !profile.id) {
        console.error('Invalid profile data for edit modal:', profile);
        showNotification('Ошибка: данные профиля не найдены', 'error');
        return null;
    }
    
    // Если модальное окно еще не создано, создаем его
    if (!editModalInstance) {
        const modal = createModalElement('Редактировать профиль', 'edit');
        document.body.appendChild(modal.element);
        
        const closeModal = () => {
            modal.element.style.display = 'none';
            resetForm(modal.element);
            currentEditProfileId = null;
        };
        
        modal.close = closeModal;
        
        modal.element.querySelector('.close').onclick = closeModal;
        modal.element.querySelector('#cancelBtn').onclick = closeModal;
        
        // Закрытие при клике вне окна
        modal.element.addEventListener('click', (event) => {
            if (event.target === modal.element) {
                closeModal();
            }
        });
        
        modal.element.querySelector('#profileForm').onsubmit = async (event) => {
            event.preventDefault();
            
            if (!currentEditProfileId) {
                showNotification('Ошибка: профиль не выбран', 'error');
                return;
            }
            
            const formData = getFormData(modal.element);
            
            const submitBtn = modal.element.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Сохранение...';
            submitBtn.disabled = true;
            
            try {
                await updateProfile(currentEditProfileId, formData);
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
            show: (profileData) => {
                // Проверяем, что profileData передан
                if (!profileData) {
                    console.error('No profile data provided to show edit modal');
                    return;
                }
                // Заполняем форму данными профиля
                fillFormData(modal.element, profileData);
                currentEditProfileId = profileData.id;
                modal.element.style.display = 'block';
            },
            hide: closeModal
        };
    }
    
    // Показываем модальное окно с данными текущего профиля
    editModalInstance.show(profile);
    
    return editModalInstance;
}

// Создание DOM элемента модального окна
function createModalElement(title, mode) {
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
                    <button type="submit" class="btn-primary">${mode === 'create' ? 'Создать' : 'Сохранить'}</button>
                </div>
            </form>
        </div>
    `;
    
    return { element: modal };
}

// Получение данных из формы
function getFormData(modalElement) {
    return {
        first_name: modalElement.querySelector('#first_name').value || null,
        middle_name: modalElement.querySelector('#middle_name').value || null,
        last_name: modalElement.querySelector('#last_name').value || null,
        sex: modalElement.querySelector('#sex').value,
        birth_year: parseInt(modalElement.querySelector('#birth_year').value) || null,
        birth_month: parseInt(modalElement.querySelector('#birth_month').value) || null,
        birth_day: parseInt(modalElement.querySelector('#birth_day').value) || null
    };
}

// Заполнение формы данными профиля
function fillFormData(modalElement, profile) {
    // Проверяем, что modalElement и profile существуют
    if (!modalElement || !profile) {
        console.error('Cannot fill form: missing modalElement or profile');
        return;
    }
    
    const lastNameInput = modalElement.querySelector('#last_name');
    const firstNameInput = modalElement.querySelector('#first_name');
    const middleNameInput = modalElement.querySelector('#middle_name');
    const sexSelect = modalElement.querySelector('#sex');
    const birthYearInput = modalElement.querySelector('#birth_year');
    const birthMonthInput = modalElement.querySelector('#birth_month');
    const birthDayInput = modalElement.querySelector('#birth_day');
    
    // Заполняем поля с проверкой на существование
    if (lastNameInput) lastNameInput.value = profile.last_name || '';
    if (firstNameInput) firstNameInput.value = profile.first_name || '';
    if (middleNameInput) middleNameInput.value = profile.middle_name || '';
    if (sexSelect) sexSelect.value = profile.sex || 'male';
    if (birthYearInput) birthYearInput.value = profile.birth_year || '';
    if (birthMonthInput) birthMonthInput.value = profile.birth_month || '';
    if (birthDayInput) birthDayInput.value = profile.birth_day || '';
}

// Сброс формы
function resetForm(modalElement) {
    if (!modalElement) return;
    
    const form = modalElement.querySelector('#profileForm');
    if (form) form.reset();
    
    const sexSelect = modalElement.querySelector('#sex');
    if (sexSelect) {
        sexSelect.value = 'male';
    }
}