// Конфигурация: укажите адрес вашего запущенного C# проекта
const API_BASE = "http://localhost:5000"; 

// Элементы DOM
const authForm = document.getElementById('auth-form');
const emailGroup = document.getElementById('email-group');
const formTitle = document.getElementById('form-title');
const mainButton = document.getElementById('main-button');
const switchModeBtn = document.getElementById('switch-mode');

// Поля ввода
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

let isLoginMode = true; // Состояние: либо Вход, либо Регистрация

// 1. Переключение между Входом и Регистрацией
switchModeBtn.addEventListener('click', () => {
    isLoginMode = !isLoginMode;

    if (isLoginMode) {
        formTitle.textContent = "Войти в FBS";
        mainButton.textContent = "войти";
        switchModeBtn.textContent = "зарегистрироваться";
        emailGroup.style.display = "none"; // Скрываем почту
        emailInput.removeAttribute('required');
    } else {
        formTitle.textContent = "Регистрация в FBS";
        mainButton.textContent = "создать аккаунт";
        switchModeBtn.textContent = "уже есть аккаунт? войти";
        emailGroup.style.display = "block"; // Показываем почту
        emailInput.setAttribute('required', 'true');
    }
});

// 2. Обработка отправки формы (связь с C# Backend)
authForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Чтобы страница не перезагружалась

    const endpoint = isLoginMode ? '/login' : '/register';
    const url = `${API_BASE}${endpoint}`;

    // Собираем данные (названия полей должны совпадать с вашими DTO в C#)
    const payload = {
        name: usernameInput.value,
        password: passwordInput.value
    };

    if (!isLoginMode) {
        payload.email = emailInput.value;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            alert(isLoginMode ? "Вы успешно вошли!" : "Регистрация прошла успешно!");
            if (data.token) {
                localStorage.setItem('jwt', data.token); // Сохраняем токен
            }
        } else {
            alert("Ошибка: " + (data.error || data.message || "Что-то пошло не так"));
        }
    } catch (error) {
        console.error("Ошибка сети:", error);
        alert("Не удалось связаться с сервером.");
    }
});
