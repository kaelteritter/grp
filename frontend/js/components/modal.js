import { createProfile } from '../api/profiles.js';
import { renderProfilesList } from './profile_list.js';
import { showNotification } from './notifications.js';

let modalInstance = null;

export async function renderModal() {
    // Если модальное окно уже существует, возвращаем его
    if (modalInstance) {
        return modalInstance;
    }
    
    // Создаем элемент модального окна
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'profileModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Добавить профиль</h2>
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
                    <button type="submit" class="btn-primary">Создать</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Настройка обработчиков
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = modal.querySelector('#cancelBtn');
    const form = modal.querySelector('#profileForm');
    
    const closeModal = () => {
        modal.style.display = 'none';
    };
    
    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;
    
    // Закрытие при клике вне окна
    window.onclick = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    };
    
    // Обработка отправки формы
    form.onsubmit = async (event) => {
        event.preventDefault();
        
        const formData = {
            first_name: document.getElementById('first_name').value || null,
            middle_name: document.getElementById('middle_name').value || null,
            last_name: document.getElementById('last_name').value || null,
            sex: document.getElementById('sex').value,
            birth_year: parseInt(document.getElementById('birth_year').value) || null,
            birth_month: parseInt(document.getElementById('birth_month').value) || null,
            birth_day: parseInt(document.getElementById('birth_day').value) || null
        };
        
        // Валидация
        if (!formData.first_name && !formData.last_name) {
            showNotification('Укажите хотя бы имя или фамилию', 'error');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Создание...';
        submitBtn.disabled = true;
        
        try {
            await createProfile(formData);
            showNotification('Профиль успешно создан!', 'success');
            closeModal();
            form.reset();
            
            // Обновляем список профилей
            await renderProfilesList('profileList');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    };
    
    modalInstance = {
        element: modal,
        show: () => {
            modal.style.display = 'block';
            form.reset();
        },
        hide: () => {
            modal.style.display = 'none';
        }
    };
    
    return modalInstance;
}