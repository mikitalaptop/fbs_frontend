// ============================================
// API CONFIGURATION
// ============================================
const API_BASE_URL = 'http://localhost:5174';
const API_AUTH_URL = `${API_BASE_URL}/api/Auth`; // Исправлено: обратные кавычки

// ============================================
// DOM ELEMENTS (Registration)
// ============================================
const registerForm = document.getElementById('registerForm');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const registerUserName = document.getElementById('registerUserName');

// ============================================
// DOM ELEMENTS (Login)
// ============================================
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');

// ============================================
// HELPER FUNCTIONS
// ============================================

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`; // Исправлено: обратные кавычки
    messageDiv.textContent = message;

    const container = document.querySelector('.container') || document.body; // Резерв на body, если нет .container
    if (container) {
        container.insertBefore(messageDiv, container.firstChild);
    } else {
        alert(message);
    }

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function saveToken(token) {
    localStorage.setItem('authToken', token);
}

function getToken() {
    return localStorage.getItem('authToken');
}

function removeToken() {
    localStorage.removeItem('authToken');
}

function isAuthenticated() {
    return getToken() !== null;
}

function redirectToDashboard() {
    window.location.href = '/dashboard.html';
}

function redirectToLogin() {
    window.location.href = '/login.html';
}

// ============================================
// API CALLS
// ============================================

async function handleApiResponse(response) {
    if (!response.ok) {
        let errorMessage = `Error: ${response.status}`; // Исправлено: обратные кавычки
        try {
            const error = await response.json();
            // Исправлено: добавлен оператор || (ИЛИ)
            errorMessage = error.message || error.title || errorMessage;
        } catch (e) {
            errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
    }
    return await response.json();
}

// REGISTER
async function register(userData) {
    try {
        const response = await fetch(`${API_AUTH_URL}/Register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const result = await handleApiResponse(response);
        showMessage('✅ Registration successful! Please login.', 'success');
        
        if (registerForm) registerForm.reset();
        
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
        
        return result;
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Registration failed: ' + error.message, 'error');
        throw error;
    }
}

// LOGIN
async function login(credentials) {
    try {
        const response = await fetch(`${API_AUTH_URL}/Login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });

        const result = await handleApiResponse(response);
        
        if (result.token) {
            saveToken(result.token);
        } else if (typeof result === 'string') {
            saveToken(result);
        }
        
        showMessage('✅ Login successful! Redirecting...', 'success');
        
        setTimeout(() => {
            redirectToDashboard();
        }, 1000);
        
        return result;
     } catch (error) {
        console.error('Login error:', error);
        
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            showMessage('Invalid email or password', 'error');
        } else {
            showMessage('Login failed: ' + error.message, 'error');
        }
        throw error;
    }
}

// LOGOUT
function logout() {
    removeToken();
    showMessage('Logged out successfully', 'success');
    redirectToLogin();
}

// ============================================
// REGISTER FORM HANDLER
// ============================================

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userData = {
            email: registerEmail.value.trim(),
            password: registerPassword.value.trim(),
            userName: registerUserName ? registerUserName.value.trim() : registerEmail.value.trim().split('@')[0]
        };

        if (!userData.email || !userData.password) {
            showMessage('Please fill all fields', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }

        if (userData.password.length < 6) {
            showMessage('Password must be at least 6 characters', 'error');
            return;
        }

        await register(userData);
    });
}

// ============================================
// LOGIN FORM HANDLER
// ============================================

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const credentials = {
            email: loginEmail.value.trim(),
            password: loginPassword.value.trim()
        };

        if (!credentials.email || !credentials.password) {
            showMessage('Please enter email and password', 'error');
            return;
        }

        await login(credentials);
    });
}

// ============================================
// CHECK AUTH STATUS ON PAGE LOAD
// ============================================

function checkAuth() {
    const publicPages = ['/login.html', '/register.html', '/', '/index.html'];
    const currentPage = window.location.pathname;
    
    // Проверка через .some, чтобы путь работал корректно в разных окружениях
    const isPublic = publicPages.some(page => currentPage.endsWith(page));

    if (!isAuthenticated() && !isPublic) {
        redirectToLogin();
    }
    
    if (isAuthenticated() && isPublic) {
        redirectToDashboard();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});
