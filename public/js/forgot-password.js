/**
 * JVM Launchpad - Forgot Password Script
 * Gerencia o fluxo de recuperação de senha
 */

const API_URL = '/api/auth';

// Estado da aplicação
let userEmail = '';
let resetToken = '';
let resendCooldown = 0;

// ==========================================
// Inicialização
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    setupEmailForm();
    setupCodeForm();
    setupPasswordForm();
    setupCodeInputs();
    setupPasswordToggles();
    setupPasswordStrength();
});

// ==========================================
// Step 1: Formulário de Email
// ==========================================
function setupEmailForm() {
    const form = document.getElementById('emailForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const btn = document.getElementById('submitBtn1');
        const btnText = btn.querySelector('.button__text');
        const loader = btn.querySelector('.button__loader');
        const errorAlert = document.getElementById('errorAlert1');
        const errorText = document.getElementById('errorText1');

        // Hide error
        errorAlert.style.display = 'none';

        // Show loading
        btn.disabled = true;
        btnText.style.display = 'none';
        loader.style.display = 'inline';

        try {
            const response = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (result.success) {
                userEmail = email;
                showStep(2);
                document.getElementById('emailDisplay').textContent = email;
                startResendCooldown();
            } else {
                errorText.textContent = result.message || 'Erro ao enviar código';
                errorAlert.style.display = 'flex';
            }
        } catch (error) {
            errorText.textContent = 'Erro de conexão. Tente novamente.';
            errorAlert.style.display = 'flex';
        } finally {
            btn.disabled = false;
            btnText.style.display = 'inline';
            loader.style.display = 'none';
        }
    });
}

// ==========================================
// Step 2: Formulário de Código
// ==========================================
function setupCodeForm() {
    const form = document.getElementById('codeForm');
    const resendBtn = document.getElementById('resendBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const codeInputs = document.querySelectorAll('.form__code-input');
        const code = Array.from(codeInputs).map(input => input.value).join('');
        
        if (code.length !== 6) {
            showError2('Digite o código completo de 6 dígitos');
            return;
        }

        const btn = document.getElementById('submitBtn2');
        const btnText = btn.querySelector('.button__text');
        const loader = btn.querySelector('.button__loader');

        // Show loading
        btn.disabled = true;
        btnText.style.display = 'none';
        loader.style.display = 'inline';

        try {
            const response = await fetch(`${API_URL}/verify-reset-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, code })
            });

            const result = await response.json();

            if (result.success) {
                resetToken = result.data.resetToken;
                showStep(3);
            } else {
                showError2(result.message || 'Código inválido ou expirado');
            }
        } catch (error) {
            showError2('Erro de conexão. Tente novamente.');
        } finally {
            btn.disabled = false;
            btnText.style.display = 'inline';
            loader.style.display = 'none';
        }
    });

    // Reenviar código
    resendBtn.addEventListener('click', async () => {
        if (resendCooldown > 0) return;

        resendBtn.disabled = true;
        resendBtn.textContent = 'Enviando...';

        try {
            const response = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail })
            });

            const result = await response.json();

            if (result.success) {
                // Limpar inputs
                document.querySelectorAll('.form__code-input').forEach(input => input.value = '');
                document.querySelector('.form__code-input').focus();
                startResendCooldown();
            } else {
                showError2(result.message || 'Erro ao reenviar código');
            }
        } catch (error) {
            showError2('Erro de conexão. Tente novamente.');
        } finally {
            resendBtn.disabled = false;
            resendBtn.textContent = 'Reenviar';
        }
    });
}

function showError2(message) {
    const errorAlert = document.getElementById('errorAlert2');
    const errorText = document.getElementById('errorText2');
    errorText.textContent = message;
    errorAlert.style.display = 'flex';
}

function startResendCooldown() {
    resendCooldown = 60;
    const resendBtn = document.getElementById('resendBtn');
    const timerEl = document.getElementById('resendTimer');
    
    resendBtn.disabled = true;
    
    const interval = setInterval(() => {
        resendCooldown--;
        timerEl.textContent = `Aguarde ${resendCooldown}s para reenviar`;
        
        if (resendCooldown <= 0) {
            clearInterval(interval);
            resendBtn.disabled = false;
            timerEl.textContent = '';
        }
    }, 1000);
}

// ==========================================
// Step 3: Formulário de Nova Senha
// ==========================================
function setupPasswordForm() {
    const form = document.getElementById('passwordForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const btn = document.getElementById('submitBtn3');
        const btnText = btn.querySelector('.button__text');
        const loader = btn.querySelector('.button__loader');
        const errorAlert = document.getElementById('errorAlert3');
        const errorText = document.getElementById('errorText3');
        const successAlert = document.getElementById('successAlert3');
        const successText = document.getElementById('successText3');

        // Hide alerts
        errorAlert.style.display = 'none';
        successAlert.style.display = 'none';

        // Validações
        if (newPassword.length < 6) {
            errorText.textContent = 'A senha deve ter pelo menos 6 caracteres';
            errorAlert.style.display = 'flex';
            return;
        }

        if (newPassword !== confirmPassword) {
            errorText.textContent = 'As senhas não coincidem';
            errorAlert.style.display = 'flex';
            return;
        }

        // Show loading
        btn.disabled = true;
        btnText.style.display = 'none';
        loader.style.display = 'inline';

        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: userEmail, 
                    resetToken, 
                    newPassword 
                })
            });

            const result = await response.json();

            if (result.success) {
                successText.textContent = 'Senha alterada com sucesso! Redirecionando...';
                successAlert.style.display = 'flex';
                
                // Redirecionar para login
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                errorText.textContent = result.message || 'Erro ao redefinir senha';
                errorAlert.style.display = 'flex';
            }
        } catch (error) {
            errorText.textContent = 'Erro de conexão. Tente novamente.';
            errorAlert.style.display = 'flex';
        } finally {
            btn.disabled = false;
            btnText.style.display = 'inline';
            loader.style.display = 'none';
        }
    });
}

// ==========================================
// Setup Code Inputs (auto-advance)
// ==========================================
function setupCodeInputs() {
    const inputs = document.querySelectorAll('.form__code-input');
    
    inputs.forEach((input, index) => {
        // Quando digitar, avançar para próximo
        input.addEventListener('input', (e) => {
            const value = e.target.value;
            
            // Permitir apenas números
            e.target.value = value.replace(/[^0-9]/g, '');
            
            if (e.target.value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        // Backspace para voltar
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
            }
        });

        // Colar código
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
            
            if (pastedData.length === 6) {
                pastedData.split('').forEach((char, i) => {
                    if (inputs[i]) {
                        inputs[i].value = char;
                    }
                });
                inputs[5].focus();
            }
        });
    });
}

// ==========================================
// Password Toggles
// ==========================================
function setupPasswordToggles() {
    document.querySelectorAll('.form__toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
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
// Password Strength
// ==========================================
function setupPasswordStrength() {
    const passwordInput = document.getElementById('newPassword');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const fill = document.getElementById('passwordFill');
            const text = document.getElementById('passwordText');

            if (!fill || !text) return;

            // Remove previous classes
            fill.classList.remove('form__password-fill--weak', 'form__password-fill--medium', 'form__password-fill--strong');

            if (password.length === 0) {
                fill.style.width = '0%';
                text.textContent = 'Digite uma senha';
                return;
            }

            let strength = 0;
            if (password.length >= 6) strength++;
            if (password.length >= 8) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^A-Za-z0-9]/.test(password)) strength++;

            if (strength <= 2) {
                fill.style.width = '33%';
                fill.classList.add('form__password-fill--weak');
                text.textContent = 'Fraca';
            } else if (strength <= 3) {
                fill.style.width = '66%';
                fill.classList.add('form__password-fill--medium');
                text.textContent = 'Média';
            } else {
                fill.style.width = '100%';
                fill.classList.add('form__password-fill--strong');
                text.textContent = 'Forte';
            }
        });
    }
}

// ==========================================
// Show Step
// ==========================================
function showStep(step) {
    document.querySelectorAll('.auth__step').forEach(el => el.style.display = 'none');
    document.getElementById(`step${step}`).style.display = 'block';
    
    // Focar no primeiro input
    if (step === 2) {
        document.querySelector('.form__code-input').focus();
    } else if (step === 3) {
        document.getElementById('newPassword').focus();
    }
}
