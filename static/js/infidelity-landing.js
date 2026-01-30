/**
 * Infidelity Landing Page - Standalone JavaScript
 * Обробка форми, валідація, Fetch API для POST запитів
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    initializeScrollBehavior();
});

/**
 * Ініціалізація форми та її обробников
 */
function initializeForm() {
    const form = document.getElementById('infidelity-form');
    if (!form) return;

    form.addEventListener('submit', handleFormSubmit);
    
    // Маска для телефону
    const phoneInput = document.getElementById('form-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneInput);
    }
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
        const response = await fetch('/perevirka-na-zradu/submit/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            body: formData,
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = '/perevirka-na-zradu/thank-you/';
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
 * Форматування номера телефону
 * @param {Event} event - подія input
 */
function formatPhoneInput(event) {
    let value = event.target.value.replace(/\D/g, '');
    
    // Обмежуємо до 12 цифр (38 + 10 цифр)
    if (value.length > 12) {
        value = value.substring(0, 12);
    }

    // Форматуємо
    if (value.length === 0) {
        event.target.value = '';
    } else if (value.length <= 2) {
        event.target.value = '+' + value;
    } else if (value.length <= 4) {
        event.target.value = '+' + value.substring(0, 2) + ' (' + value.substring(2);
    } else if (value.length <= 6) {
        event.target.value = '+' + value.substring(0, 2) + ' (' + value.substring(2, 4) + ') ' + value.substring(4);
    } else if (value.length <= 9) {
        event.target.value = '+' + value.substring(0, 2) + ' (' + value.substring(2, 4) + ') ' + value.substring(4, 7) + '-' + value.substring(7);
    } else {
        event.target.value = '+' + value.substring(0, 2) + ' (' + value.substring(2, 4) + ') ' + value.substring(4, 7) + '-' + value.substring(7, 9) + '-' + value.substring(9);
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
            field.classList.add('infidelity-form__input--error');
            
            // Видалимо клас помилки при редагуванні
            field.addEventListener('input', function() {
                this.classList.remove('infidelity-form__input--error');
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
    messageElement.className = `infidelity-message infidelity-message--${type}`;
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
    const form = document.getElementById('infidelity-form');
    if (form) {
        form.style.display = 'none';
    }
}

/**
 * Показ повідомлення про успіх
 */
function showSuccessMessage() {
    const successElement = document.getElementById('form-success');
    if (successElement) {
        successElement.style.display = 'block';
    }
}

/**
 * Плавне прокручування до форми
 */
function scrollToForm() {
    const formSection = document.getElementById('form-section');
    if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Ініціалізація поведінки прокручування
 */
function initializeScrollBehavior() {
    // Додаємо слухачі до всіх посилань на якорі
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
 * Валідація на клієнті перед відправкою
 */
function validateForm(form) {
    const name = form.querySelector('[name="name"]')?.value?.trim();
    const phone = form.querySelector('[name="phone"]')?.value?.trim();

    if (!name) {
        showMessage('Будь ласка, введіть ім\'я', 'error');
        return false;
    }

    if (!phone) {
        showMessage('Будь ласка, введіть номер телефону', 'error');
        return false;
    }

    // Базова перевірка формату телефону
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
        showMessage('Номер телефону занадто короткий', 'error');
        return false;
    }

    return true;
}

/**
 * Додаємо стиль для помилок при фокусі
 */
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .infidelity-form__input--error {
        border-color: #dc2626;
        background-color: rgba(220, 38, 38, 0.1);
    }
`;
document.head.appendChild(styleSheet);
