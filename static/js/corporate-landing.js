/**
 * Corporate Landing Page - Standalone JavaScript
 * Обробка форми, форматування телефону, копіювання промокоду
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    initializePhoneFormatting();
    initializeSmoothScroll();
});

/**
 * Ініціалізація форми та обробников
 */
function initializeForm() {
    const form = document.getElementById('corporate-form');
    if (!form) return;

    form.addEventListener('submit', handleFormSubmit);
}

/**
 * Обробка відправки форми
 * @param {Event} event - подія submit
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const messagesContainer = document.getElementById('form-messages');

    // Очистимо попередні повідомлення
    messagesContainer.innerHTML = '';

    // Отримаємо CSRF токен
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    
    if (!csrfToken) {
        showMessage('Помилка безпеки: CSRF токен не знайдено', 'error');
        return;
    }

    try {
        // Виконуємо POST запит
        const response = await fetch('/korporatyvni-poslugy/submit/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            body: formData,
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = '/korporatyvni-poslugy/thank-you/';
            return;
        } else {
            // Помилка валідації або серверна помилка
            if (data.errors) {
                displayFieldErrors(data.errors, form);
            } else {
                showMessage(data.error || 'Помилка при відправці форми', 'error');
            }
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showMessage('Помилка мережі. Спробуйте ще раз.', 'error');
    }
}

/**
 * Ініціалізація форматування телефону
 */
function initializePhoneFormatting() {
    const phoneInput = document.getElementById('clientPhone');
    if (!phoneInput) return;

    phoneInput.addEventListener('input', formatPhoneInput);
}

/**
 * Форматування номера телефону
 * Формат: +38(0XX) XXX-XX-XX
 * НЕ видаляємо "0", просто додаємо "38" перед ним
 * @param {Event} event - подія input
 */
function formatPhoneInput(event) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length === 0) {
        event.target.value = '';
        return;
    }
    
    // Якщо почав з "8" - замінюємо на "0"
    if (value.startsWith('8')) {
        value = '0' + value.substring(1);
    }
    
    // Додаємо "38" ПЕРЕД номером (НЕ видаляючи "0")
    if (!value.startsWith('38')) {
        value = '38' + value;
    }
    
    // Обмежуємо до 12 цифр (38 + 0XX + 9 цифр)
    if (value.length > 12) {
        value = value.substring(0, 12);
    }
    
    // Форматуємо: +38(0XX) XXX-XX-XX (3-2-2)
    if (value.length <= 2) {
        event.target.value = '+38(';
    } else if (value.length <= 5) {
        event.target.value = '+38(' + value.substring(2);
    } else if (value.length <= 8) {
        event.target.value = '+38(' + value.substring(2, 5) + ') ' + value.substring(5);
    } else if (value.length <= 10) {
        event.target.value = '+38(' + value.substring(2, 5) + ') ' + value.substring(5, 8) + '-' + value.substring(8);
    } else {
        event.target.value = '+38(' + value.substring(2, 5) + ') ' + value.substring(5, 8) + '-' + value.substring(8, 10) + '-' + value.substring(10);
    }
}

/**
 * Показ помилок валідації для полів
 * @param {Object} errors - об'єкт з помилками {fieldName: 'error message'}
 * @param {HTMLFormElement} form - форма
 */
function displayFieldErrors(errors, form) {
    Object.entries(errors).forEach(([fieldName, errorMessage]) => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            showMessage(errorMessage, 'error');
            field.focus();
            field.classList.add('corporate-form__input--error');
            
            // Видалимо клас помилки при редагуванні
            field.addEventListener('input', function() {
                this.classList.remove('corporate-form__input--error');
            }, { once: true });
        }
    });
}

/**
 * Показ повідомлення (помилка або інше)
 * @param {string} message - текст повідомлення
 * @param {string} type - тип: 'error' або 'success'
 */
function showMessage(message, type = 'error') {
    const messagesContainer = document.getElementById('form-messages');
    if (!messagesContainer) return;

    const messageElement = document.createElement('div');
    messageElement.className = `corporate-form__message corporate-form__message--${type}`;
    messageElement.textContent = message;
    messagesContainer.appendChild(messageElement);

    // Автоматично видалимо через 5 секунд
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}

/**
 * Приховування форми
 */
function hideForm() {
    const form = document.getElementById('corporate-form');
    if (form) {
        form.style.display = 'none';
    }
}

/**
 * Показ повідомлення про успіх
 */
function showSuccessMessage() {
    const successElement = document.getElementById('success-message');
    if (successElement) {
        successElement.style.display = 'block';
    }
}

/**
 * Копіювання промокоду в буфер обміну
 */
function copyPromo() {
    const promoCode = document.getElementById('promo-code')?.textContent;
    if (!promoCode) return;

    navigator.clipboard.writeText(promoCode).then(() => {
        showNotification('Промокод скопійовано!');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

/**
 * Показ сповіщення про успіх
 * @param {string} message - текст сповіщення
 */
function showNotification(message) {
    const notification = document.getElementById('copy-notification');
    if (!notification) return;

    notification.textContent = '';
    
    const icon = document.createElement('svg');
    icon.setAttribute('fill', 'currentColor');
    icon.setAttribute('viewBox', '0 0 20 20');
    icon.innerHTML = '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />';
    
    const text = document.createElement('span');
    text.textContent = message;
    
    notification.appendChild(icon);
    notification.appendChild(text);
    notification.style.display = 'flex';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

/**
 * Ініціалізація плавного прокручування
 */
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/**
 * Додаємо стиль для помилок при фокусі
 */
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .corporate-form__input--error {
        border-color: #ef4444;
        background-color: rgba(239, 68, 68, 0.05);
    }
`;
document.head.appendChild(styleSheet);
