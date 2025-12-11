/**
 * JVM Launchpad - Authentication Script
 * Gerencia login e registro de usuários
 */

(function() {
    'use strict';

    // ==========================================
    // Configurações
    // ==========================================
    const CONFIG = {
        API_URL: '/api/auth',
        TOKEN_KEY: 'jvm_token',
        USER_KEY: 'jvm_user'
    };

    // ==========================================
    // Utilitários de Storage
    // ==========================================
    const Storage = {
        get: (key) => {
            try {
                const item = localStorage.getItem(key);
                if (!item) return null;
                // Token não precisa de parse
                if (key === CONFIG.TOKEN_KEY) return item;
                return JSON.parse(item);
            } catch (e) {
                return localStorage.getItem(key);
            }
        },
        
        set: (key, value) => {
            try {
                // Token é string simples, não precisa stringify
                if (key === CONFIG.TOKEN_KEY) {
                    localStorage.setItem(key, value);
                } else {
                    localStorage.setItem(key, JSON.stringify(value));
                }
            } catch (e) {
                console.error('Erro ao salvar no storage:', e);
            }
        }
    };

    // ==========================================
    // Elementos do DOM
    // ==========================================
    const elements = {
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        errorAlert: document.getElementById('errorAlert'),
        errorText: document.getElementById('errorText'),
        successAlert: document.getElementById('successAlert'),
        successText: document.getElementById('successText'),
        submitBtn: document.getElementById('submitBtn'),
        passwordInput: document.getElementById('password'),
        confirmPasswordInput: document.getElementById('confirmPassword'),
        passwordFill: document.getElementById('passwordFill'),
        passwordText: document.getElementById('passwordText'),
        togglePasswordBtns: document.querySelectorAll('.form__toggle-password')
    };

    // ==========================================
    // Funções de UI
    // ==========================================
    function showError(message) {
        if (elements.errorAlert && elements.errorText) {
            elements.errorText.textContent = message;
            elements.errorAlert.style.display = 'flex';
            elements.successAlert.style.display = 'none';
        }
    }

    function showSuccess(message) {
        if (elements.successAlert && elements.successText) {
            elements.successText.textContent = message;
            elements.successAlert.style.display = 'flex';
            elements.errorAlert.style.display = 'none';
        }
    }

    function hideAlerts() {
        if (elements.errorAlert) elements.errorAlert.style.display = 'none';
        if (elements.successAlert) elements.successAlert.style.display = 'none';
    }

    function setLoading(isLoading) {
        if (!elements.submitBtn) return;
        
        const btnText = elements.submitBtn.querySelector('.button__text');
        const btnLoader = elements.submitBtn.querySelector('.button__loader');
        
        if (isLoading) {
            elements.submitBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoader) btnLoader.style.display = 'block';
        } else {
            elements.submitBtn.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnLoader) btnLoader.style.display = 'none';
        }
    }

    // ==========================================
    // Validação de Senha
    // ==========================================
    function checkPasswordStrength(password) {
        let strength = 0;
        
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        return strength;
    }

    function updatePasswordStrength() {
        if (!elements.passwordInput || !elements.passwordFill || !elements.passwordText) return;
        
        const password = elements.passwordInput.value;
        const strength = checkPasswordStrength(password);
        
        // Remover classes anteriores
        elements.passwordFill.classList.remove(
            'form__password-fill--weak',
            'form__password-fill--medium',
            'form__password-fill--strong'
        );
        
        if (password.length === 0) {
            elements.passwordFill.style.width = '0%';
            elements.passwordText.textContent = 'Digite uma senha';
            return;
        }
        
        if (strength <= 2) {
            elements.passwordFill.classList.add('form__password-fill--weak');
            elements.passwordText.textContent = 'Fraca';
        } else if (strength <= 3) {
            elements.passwordFill.classList.add('form__password-fill--medium');
            elements.passwordText.textContent = 'Média';
        } else {
            elements.passwordFill.classList.add('form__password-fill--strong');
            elements.passwordText.textContent = 'Forte';
        }
    }

    // ==========================================
    // Toggle de Senha (Mostrar/Ocultar)
    // ==========================================
    function initPasswordToggle() {
        elements.togglePasswordBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.parentElement.querySelector('input');
                if (input.type === 'password') {
                    input.type = 'text';
                    this.textContent = '🙈';
                } else {
                    input.type = 'password';
                    this.textContent = '👁';
                }
            });
        });
    }

    // ==========================================
    // API Calls
    // ==========================================
    async function apiCall(endpoint, data) {
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro na API:', error);
            throw new Error('Erro de conexão. Tente novamente.');
        }
    }

    // ==========================================
    // Handler de Login
    // ==========================================
    async function handleLogin(e) {
        e.preventDefault();
        hideAlerts();
        setLoading(true);
        
        const formData = new FormData(e.target);
        const data = {
            email: formData.get('email'),
            password: formData.get('password')
        };
        
        try {
            const result = await apiCall('/login', data);
            
            if (result.success) {
                // Salvar token e dados do usuário
                Storage.set(CONFIG.TOKEN_KEY, result.data.token);
                Storage.set(CONFIG.USER_KEY, result.data.user);
                
                showSuccess('Login realizado com sucesso! Redirecionando...');
                
                // Redirecionar para dashboard
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                showError(result.message || 'Erro ao realizar login');
            }
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    }

    // ==========================================
    // Handler de Registro
    // ==========================================
    async function handleRegister(e) {
        e.preventDefault();
        hideAlerts();
        
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password')
        };
        const confirmPassword = formData.get('confirmPassword');
        
        // Validações
        if (data.password !== confirmPassword) {
            showError('As senhas não coincidem');
            return;
        }
        
        if (data.password.length < 6) {
            showError('A senha deve ter pelo menos 6 caracteres');
            return;
        }
        
        setLoading(true);
        
        try {
            const result = await apiCall('/register', data);
            
            if (result.success) {
                // Salvar token e dados do usuário
                Storage.set(CONFIG.TOKEN_KEY, result.data.token);
                Storage.set(CONFIG.USER_KEY, result.data.user);
                
                showSuccess('Conta criada com sucesso! Redirecionando...');
                
                // Redirecionar para dashboard
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                showError(result.message || 'Erro ao criar conta');
            }
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    }

    // ==========================================
    // Verificar se já está autenticado
    // ==========================================
    function checkAuth() {
        const token = Storage.get(CONFIG.TOKEN_KEY);
        if (token) {
            window.location.href = '/dashboard';
        }
    }

    // ==========================================
    // Inicialização
    // ==========================================
    function init() {
        // Verificar autenticação
        checkAuth();
        
        // Inicializar toggle de senha
        initPasswordToggle();
        
        // Event listeners para formulários
        if (elements.loginForm) {
            elements.loginForm.addEventListener('submit', handleLogin);
        }
        
        if (elements.registerForm) {
            elements.registerForm.addEventListener('submit', handleRegister);
            
            // Listener para força da senha
            if (elements.passwordInput) {
                elements.passwordInput.addEventListener('input', updatePasswordStrength);
            }
        }
    }

    // Executar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

