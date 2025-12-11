/**
 * JVM Launchpad - Settings Page Script
 * Gerencia todas as configurações do usuário
 */

// Configuração - Usar as mesmas chaves do resto da aplicação
const CONFIG = {
    API_URL: '/api/auth',
    TOKEN_KEY: 'jvm_token',
    USER_KEY: 'jvm_user',
    SETTINGS_KEY: 'jvm_settings'
};

// ==========================================
// Verificação de Autenticação
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    if (!token) {
        window.location.href = '/login';
        return;
    }

    // Inicializar página
    init();
});

// ==========================================
// Inicialização
// ==========================================
function init() {
    loadUserAvatar();
    loadSettings();
    setupToggleHandlers();
    setupPasswordChangeHandler();
    setupPasswordToggles();
    setupPasswordStrength();
    setupActionButtons();
    setupSaveHandler();
    setupLogoutHandler();
}

// ==========================================
// Carregar Avatar do Header
// ==========================================
function loadUserAvatar() {
    const user = JSON.parse(localStorage.getItem(CONFIG.USER_KEY) || '{}');
    const userAvatar = document.getElementById('userAvatar');
    
    if (userAvatar && user.name) {
        if (user.avatarUrl) {
            userAvatar.innerHTML = `<img src="${user.avatarUrl}" alt="Avatar" class="header__avatar-img">`;
        } else {
            userAvatar.textContent = user.name.charAt(0).toUpperCase();
        }
    }
}

// ==========================================
// Carregar Configurações
// ==========================================
async function loadSettings() {
    // Primeiro, carregar do localStorage
    const localSettings = JSON.parse(localStorage.getItem(CONFIG.SETTINGS_KEY) || '{}');
    applySettings(localSettings);

    // Depois, tentar carregar do servidor
    try {
        const token = localStorage.getItem(CONFIG.TOKEN_KEY);
        const response = await fetch(`${CONFIG.API_URL}/settings`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        if (result.success && result.data) {
            // Mesclar com configurações locais
            const mergedSettings = { ...localSettings, ...result.data };
            localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(mergedSettings));
            applySettings(mergedSettings);
        }
    } catch (error) {
        console.log('Usando configurações locais');
    }
}

// ==========================================
// Aplicar Configurações na UI
// ==========================================
function applySettings(settings) {
    // Tema
    const darkModeToggle = document.getElementById('darkMode');
    if (darkModeToggle) {
        darkModeToggle.checked = settings.darkMode !== false;
        applyDarkMode(settings.darkMode !== false);
        updateToggleLabel(darkModeToggle);
    }

    // Animações
    const animationsToggle = document.getElementById('animations');
    if (animationsToggle) {
        animationsToggle.checked = settings.animations !== false;
        applyAnimations(settings.animations !== false);
        updateToggleLabel(animationsToggle);
    }

    // Notificações por Email
    const emailNotifToggle = document.getElementById('emailNotif');
    if (emailNotifToggle) {
        emailNotifToggle.checked = settings.emailNotif !== false;
        updateToggleLabel(emailNotifToggle);
    }

    // Notificações Push
    const pushNotifToggle = document.getElementById('pushNotif');
    if (pushNotifToggle) {
        pushNotifToggle.checked = settings.pushNotif === true;
        updateToggleLabel(pushNotifToggle);
    }

    // Perfil Público
    const publicProfileToggle = document.getElementById('publicProfile');
    if (publicProfileToggle) {
        publicProfileToggle.checked = settings.publicProfile === true;
        updateToggleLabelPublic(publicProfileToggle);
    }

    // Idioma
    const languageSelect = document.querySelector('.settings__select');
    if (languageSelect && settings.language) {
        languageSelect.value = settings.language;
    }
}

// ==========================================
// Setup de Toggle Handlers
// ==========================================
function setupToggleHandlers() {
    const toggles = document.querySelectorAll('.toggle__input');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            handleToggleChange(this);
        });
    });

    // Idioma
    const languageSelect = document.querySelector('.settings__select');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            showNotification('Idioma alterado para ' + this.options[this.selectedIndex].text, 'success');
            autoSaveSettings();
        });
    }
}

// ==========================================
// Atualizar Labels dos Toggles
// ==========================================
function updateToggleLabel(toggle) {
    const label = toggle.closest('.settings__toggle')?.querySelector('.settings__toggle-label');
    if (label && !toggle.disabled) {
        if (toggle.id === 'darkMode') {
            label.textContent = toggle.checked ? 'Modo Escuro' : 'Modo Claro';
        } else {
            label.textContent = toggle.checked ? 'Ativado' : 'Desativado';
        }
    }
}

function updateToggleLabelPublic(toggle) {
    const label = toggle.closest('.settings__toggle')?.querySelector('.settings__toggle-label');
    if (label) {
        label.textContent = toggle.checked ? 'Público' : 'Privado';
    }
}

// ==========================================
// Handler de Toggle Change
// ==========================================
function handleToggleChange(toggle) {
    const id = toggle.id;

    switch(id) {
        case 'darkMode':
            applyDarkMode(toggle.checked);
            updateToggleLabel(toggle);
            showNotification(toggle.checked ? 'Modo escuro ativado' : 'Modo claro ativado', 'success');
            break;
        case 'animations':
            applyAnimations(toggle.checked);
            updateToggleLabel(toggle);
            showNotification(toggle.checked ? 'Animações ativadas' : 'Animações desativadas', 'success');
            break;
        case 'emailNotif':
            updateToggleLabel(toggle);
            showNotification(toggle.checked ? 'Notificações por email ativadas' : 'Notificações por email desativadas', 'success');
            break;
        case 'pushNotif':
            if (toggle.checked) {
                requestNotificationPermission(toggle);
            } else {
                updateToggleLabel(toggle);
                showNotification('Notificações push desativadas', 'success');
            }
            break;
        case 'publicProfile':
            updateToggleLabelPublic(toggle);
            showNotification(toggle.checked ? 'Perfil agora é público' : 'Perfil agora é privado', 'success');
            break;
    }

    autoSaveSettings();
}

// ==========================================
// Aplicar Tema (usa o script global)
// ==========================================
function applyDarkMode(enabled) {
    if (enabled) {
        document.documentElement.classList.remove('light-mode');
        document.body.classList.remove('light-mode');
    } else {
        document.documentElement.classList.add('light-mode');
        document.body.classList.add('light-mode');
    }
    
    // Usar o tema global se disponível
    if (window.JVMTheme) {
        window.JVMTheme.setDarkMode(enabled);
    }
}

// ==========================================
// Aplicar Animações (usa o script global)
// ==========================================
function applyAnimations(enabled) {
    if (enabled) {
        document.documentElement.classList.remove('no-animations');
        document.body.classList.remove('no-animations');
    } else {
        document.documentElement.classList.add('no-animations');
        document.body.classList.add('no-animations');
    }
    
    // Usar o tema global se disponível
    if (window.JVMTheme) {
        window.JVMTheme.setAnimations(enabled);
    }
}

// ==========================================
// Notificações Push
// ==========================================
async function requestNotificationPermission(toggle) {
    if ('Notification' in window) {
        try {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                updateToggleLabel(toggle);
                showNotification('Notificações push ativadas!', 'success');
                
                // Mostrar notificação de teste
                new Notification('JVM Launchpad', {
                    body: 'Notificações push ativadas com sucesso!',
                    icon: '/assets/favicon.svg'
                });
            } else {
                toggle.checked = false;
                updateToggleLabel(toggle);
                showNotification('Permissão de notificação negada pelo navegador', 'error');
            }
        } catch (error) {
            toggle.checked = false;
            updateToggleLabel(toggle);
            showNotification('Erro ao ativar notificações', 'error');
        }
    } else {
        toggle.checked = false;
        updateToggleLabel(toggle);
        showNotification('Seu navegador não suporta notificações push', 'error');
    }
}

// ==========================================
// Setup de Troca de Senha
// ==========================================
function setupPasswordChangeHandler() {
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', handlePasswordChange);
    }
}

async function handlePasswordChange() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    const errorAlert = document.getElementById('passwordErrorAlert');
    const errorText = document.getElementById('passwordErrorText');
    const successAlert = document.getElementById('passwordSuccessAlert');
    const successText = document.getElementById('passwordSuccessText');
    const btn = document.getElementById('changePasswordBtn');
    const btnText = btn.querySelector('.button__text');
    const btnLoader = btn.querySelector('.button__loader');

    // Esconder alertas
    errorAlert.style.display = 'none';
    successAlert.style.display = 'none';

    // Validações
    if (!currentPassword) {
        errorText.textContent = 'Digite sua senha atual';
        errorAlert.style.display = 'flex';
        return;
    }

    if (!newPassword) {
        errorText.textContent = 'Digite a nova senha';
        errorAlert.style.display = 'flex';
        return;
    }

    if (newPassword.length < 6) {
        errorText.textContent = 'A nova senha deve ter pelo menos 6 caracteres';
        errorAlert.style.display = 'flex';
        return;
    }

    if (newPassword !== confirmNewPassword) {
        errorText.textContent = 'As senhas não coincidem';
        errorAlert.style.display = 'flex';
        return;
    }

    if (currentPassword === newPassword) {
        errorText.textContent = 'A nova senha deve ser diferente da atual';
        errorAlert.style.display = 'flex';
        return;
    }

    // Mostrar loading
    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';

    try {
        const token = localStorage.getItem(CONFIG.TOKEN_KEY);
        const response = await fetch(`${CONFIG.API_URL}/change-password`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const result = await response.json();

        if (result.success) {
            successText.textContent = 'Senha alterada com sucesso!';
            successAlert.style.display = 'flex';
            
            // Limpar campos
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmNewPassword').value = '';
            
            // Resetar indicador de força
            const passwordFill = document.getElementById('passwordFill');
            const passwordStrengthText = document.getElementById('passwordStrengthText');
            if (passwordFill) passwordFill.style.width = '0%';
            if (passwordStrengthText) passwordStrengthText.textContent = 'Digite uma senha';
        } else {
            errorText.textContent = result.message || 'Erro ao alterar senha';
            errorAlert.style.display = 'flex';
        }
    } catch (error) {
        errorText.textContent = 'Erro de conexão. Tente novamente.';
        errorAlert.style.display = 'flex';
    } finally {
        btn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

// ==========================================
// Setup de Password Toggles (Mostrar/Ocultar)
// ==========================================
function setupPasswordToggles() {
    const toggleBtns = document.querySelectorAll('.form__toggle-password');
    
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    this.textContent = '🙈';
                } else {
                    input.type = 'password';
                    this.textContent = '👁';
                }
            }
        });
    });
}

// ==========================================
// Setup de Indicador de Força da Senha
// ==========================================
function setupPasswordStrength() {
    const newPasswordInput = document.getElementById('newPassword');
    
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    }
}

function updatePasswordStrength(password) {
    const fill = document.getElementById('passwordFill');
    const text = document.getElementById('passwordStrengthText');
    
    if (!fill || !text) return;

    // Remover classes anteriores
    fill.classList.remove('form__password-fill--weak', 'form__password-fill--medium', 'form__password-fill--strong');

    if (password.length === 0) {
        fill.style.width = '0%';
        text.textContent = 'Digite uma senha';
        return;
    }

    const strength = calculatePasswordStrength(password);

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
}

function calculatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return strength;
}

// ==========================================
// Setup de Botões de Ação
// ==========================================
function setupActionButtons() {
    // Encerrar todas as sessões
    const logoutAllBtn = document.getElementById('logoutAllBtn');
    if (logoutAllBtn) {
        logoutAllBtn.addEventListener('click', handleLogoutAll);
    }

    // Deletar conta
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', handleDeleteAccount);
    }

    // Restaurar padrões
    const restoreBtn = document.querySelector('.settings__footer .button--secondary');
    if (restoreBtn) {
        restoreBtn.addEventListener('click', handleRestoreDefaults);
    }

    // Exportar dados
    document.addEventListener('click', function(e) {
        const target = e.target.closest('.button');
        if (!target) return;
        
        const text = target.querySelector('.button__text')?.textContent.toLowerCase();
        
        if (text?.includes('exportar')) {
            handleExportData();
        } else if (text?.includes('limpar')) {
            handleClearCache();
        }
    });
}

// ==========================================
// Encerrar Todas as Sessões
// ==========================================
function handleLogoutAll() {
    if (confirm('Isso irá desconectar você de todos os dispositivos. Deseja continuar?')) {
        localStorage.removeItem(CONFIG.TOKEN_KEY);
        localStorage.removeItem(CONFIG.USER_KEY);
        showNotification('Todas as sessões foram encerradas', 'success');
        setTimeout(() => {
            window.location.href = '/login';
        }, 1500);
    }
}

// ==========================================
// Deletar Conta
// ==========================================
async function handleDeleteAccount() {
    const password = prompt('⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\nDigite sua senha para confirmar a exclusão da conta:');
    
    if (!password) return;

    if (!confirm('Tem CERTEZA que deseja deletar sua conta?\n\nTodos os seus dados serão perdidos permanentemente.')) {
        return;
    }

    try {
        const token = localStorage.getItem(CONFIG.TOKEN_KEY);
        const response = await fetch(`${CONFIG.API_URL}/delete-account`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        const result = await response.json();

        if (result.success) {
            localStorage.removeItem(CONFIG.TOKEN_KEY);
            localStorage.removeItem(CONFIG.USER_KEY);
            localStorage.removeItem(CONFIG.SETTINGS_KEY);
            
            alert('Sua conta foi deletada com sucesso.');
            window.location.href = '/';
        } else {
            showNotification(result.message || 'Erro ao deletar conta', 'error');
        }
    } catch (error) {
        showNotification('Erro de conexão. Tente novamente.', 'error');
    }
}

// ==========================================
// Restaurar Padrões
// ==========================================
function handleRestoreDefaults() {
    if (confirm('Restaurar todas as configurações para os valores padrão?')) {
        const defaultSettings = {
            darkMode: true,
            animations: true,
            emailNotif: true,
            pushNotif: false,
            publicProfile: false,
            language: 'pt-BR'
        };

        localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(defaultSettings));
        applySettings(defaultSettings);
        showNotification('Configurações restauradas para o padrão', 'success');
    }
}

// ==========================================
// Exportar Dados
// ==========================================
function handleExportData() {
    const user = JSON.parse(localStorage.getItem(CONFIG.USER_KEY) || '{}');
    const settings = JSON.parse(localStorage.getItem(CONFIG.SETTINGS_KEY) || '{}');

    const exportData = {
        user: {
            name: user.name,
            email: user.email,
            id: user.id
        },
        settings: settings,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jvm-launchpad-dados.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Dados exportados com sucesso!', 'success');
}

// ==========================================
// Limpar Cache
// ==========================================
function handleClearCache() {
    if (confirm('Deseja limpar o cache local?')) {
        // Preservar dados essenciais
        const token = localStorage.getItem(CONFIG.TOKEN_KEY);
        const user = localStorage.getItem(CONFIG.USER_KEY);
        const settings = localStorage.getItem(CONFIG.SETTINGS_KEY);

        // Limpar tudo
        localStorage.clear();
        sessionStorage.clear();

        // Restaurar dados essenciais
        if (token) localStorage.setItem(CONFIG.TOKEN_KEY, token);
        if (user) localStorage.setItem(CONFIG.USER_KEY, user);
        if (settings) localStorage.setItem(CONFIG.SETTINGS_KEY, settings);

        showNotification('Cache limpo com sucesso!', 'success');
    }
}

// ==========================================
// Setup do Botão Salvar
// ==========================================
function setupSaveHandler() {
    const saveBtn = document.getElementById('saveSettingsBtn');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', async function() {
            const btnText = this.querySelector('.button__text');
            const originalText = btnText.textContent;

            btnText.textContent = 'Salvando...';
            this.disabled = true;

            await saveSettingsToServer();

            btnText.textContent = '✓ Salvo!';
            
            setTimeout(() => {
                btnText.textContent = originalText;
                this.disabled = false;
            }, 1500);
        });
    }
}

// ==========================================
// Salvar Configurações
// ==========================================
function getSettings() {
    return {
        darkMode: document.getElementById('darkMode')?.checked !== false,
        animations: document.getElementById('animations')?.checked !== false,
        emailNotif: document.getElementById('emailNotif')?.checked !== false,
        pushNotif: document.getElementById('pushNotif')?.checked === true,
        publicProfile: document.getElementById('publicProfile')?.checked === true,
        language: document.querySelector('.settings__select')?.value || 'pt-BR'
    };
}

function autoSaveSettings() {
    const settings = getSettings();
    localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(settings));
}

async function saveSettingsToServer() {
    const settings = getSettings();
    localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(settings));

    try {
        const token = localStorage.getItem(CONFIG.TOKEN_KEY);
        await fetch(`${CONFIG.API_URL}/settings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });
        
        showNotification('Configurações salvas!', 'success');
    } catch (error) {
        console.log('Configurações salvas localmente');
    }
}

// ==========================================
// Setup do Logout
// ==========================================
function setupLogoutHandler() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('Deseja realmente sair?')) {
                localStorage.removeItem(CONFIG.TOKEN_KEY);
                localStorage.removeItem(CONFIG.USER_KEY);
                window.location.href = '/login';
            }
        });
    }
}

// ==========================================
// Sistema de Notificações
// ==========================================
function showNotification(message, type = 'info') {
    // Remover notificação existente
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) {
        existingNotif.remove();
    }

    // Criar notificação
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <span class="notification__icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
        <span class="notification__text">${message}</span>
    `;

    // Estilos inline
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-family: 'Rajdhani', sans-serif;
        font-weight: 600;
        font-size: 0.95rem;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        ${type === 'success' ? 'background: linear-gradient(135deg, #10b981, #059669); color: white;' : ''}
        ${type === 'error' ? 'background: linear-gradient(135deg, #e63946, #c62828); color: white;' : ''}
        ${type === 'info' ? 'background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white;' : ''}
    `;

    // Adicionar animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
