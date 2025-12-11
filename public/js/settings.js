// Settings Page - JVM Launchpad
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Load settings
    loadSettings();

    // Setup handlers
    setupToggleHandlers();
    setupSaveHandler();
    setupLogoutHandler();
});

// Load saved settings
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');

    // Set toggle states
    setToggleState('darkMode', settings.darkMode !== false);
    setToggleState('animations', settings.animations !== false);
    setToggleState('emailNotif', settings.emailNotif !== false);
    setToggleState('pushNotif', settings.pushNotif === true);
    setToggleState('publicProfile', settings.publicProfile === true);

    // Set language
    const languageSelect = document.querySelector('.settings__select');
    if (languageSelect && settings.language) {
        languageSelect.value = settings.language;
    }

    // Apply dark mode
    applyDarkMode(settings.darkMode !== false);

    // Apply animations
    applyAnimations(settings.animations !== false);
}

// Set toggle state
function setToggleState(id, checked) {
    const toggle = document.getElementById(id);
    if (toggle) {
        toggle.checked = checked;
        updateToggleLabel(toggle);
    }
}

// Setup toggle handlers
function setupToggleHandlers() {
    const toggles = document.querySelectorAll('.toggle__input');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            updateToggleLabel(this);
            handleToggleChange(this);
        });
    });

    // Language select
    const languageSelect = document.querySelector('.settings__select');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            saveSettings();
        });
    }
}

// Update toggle label
function updateToggleLabel(toggle) {
    const label = toggle.closest('.settings__toggle').querySelector('.settings__toggle-label');
    if (label && !toggle.disabled) {
        label.textContent = toggle.checked ? 'Ativado' : 'Desativado';
    }
}

// Handle toggle change
function handleToggleChange(toggle) {
    const id = toggle.id;

    switch(id) {
        case 'darkMode':
            applyDarkMode(toggle.checked);
            break;
        case 'animations':
            applyAnimations(toggle.checked);
            break;
        case 'pushNotif':
            if (toggle.checked) {
                requestNotificationPermission();
            }
            break;
    }

    saveSettings();
}

// Apply dark mode
function applyDarkMode(enabled) {
    if (enabled) {
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
    }
}

// Apply animations
function applyAnimations(enabled) {
    if (enabled) {
        document.body.classList.remove('no-animations');
    } else {
        document.body.classList.add('no-animations');
    }
}

// Request notification permission
async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        
        if (permission !== 'granted') {
            const pushToggle = document.getElementById('pushNotif');
            if (pushToggle) {
                pushToggle.checked = false;
                updateToggleLabel(pushToggle);
            }
            alert('Permissão de notificação negada. Você pode ativá-la nas configurações do navegador.');
        }
    } else {
        alert('Notificações não são suportadas neste navegador.');
        const pushToggle = document.getElementById('pushNotif');
        if (pushToggle) {
            pushToggle.checked = false;
            updateToggleLabel(pushToggle);
        }
    }
}

// Save settings
function saveSettings() {
    const settings = {
        darkMode: document.getElementById('darkMode')?.checked !== false,
        animations: document.getElementById('animations')?.checked !== false,
        emailNotif: document.getElementById('emailNotif')?.checked !== false,
        pushNotif: document.getElementById('pushNotif')?.checked === true,
        publicProfile: document.getElementById('publicProfile')?.checked === true,
        language: document.querySelector('.settings__select')?.value || 'pt-BR'
    };

    localStorage.setItem('settings', JSON.stringify(settings));
}

// Setup save handler
function setupSaveHandler() {
    const saveBtn = document.getElementById('saveSettingsBtn');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', async function() {
            const btnText = this.querySelector('.button__text');
            const originalText = btnText.textContent;

            // Show saving state
            btnText.textContent = 'Salvando...';
            this.disabled = true;

            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 800));

                // Save settings
                saveSettings();

                // Show success
                btnText.textContent = '✓ Salvo!';
                
                setTimeout(() => {
                    btnText.textContent = originalText;
                    this.disabled = false;
                }, 1500);
            } catch (error) {
                console.error('Error saving settings:', error);
                btnText.textContent = '✗ Erro';
                
                setTimeout(() => {
                    btnText.textContent = originalText;
                    this.disabled = false;
                }, 1500);
            }
        });
    }

    // Restore defaults button
    const restoreBtn = document.querySelector('.settings__footer .button--secondary');
    if (restoreBtn) {
        restoreBtn.addEventListener('click', function() {
            if (confirm('Restaurar todas as configurações para os valores padrão?')) {
                localStorage.removeItem('settings');
                location.reload();
            }
        });
    }
}

// Setup logout handler
function setupLogoutHandler() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('Deseja realmente sair?')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login.html';
            }
        });
    }
}

// Additional button handlers
document.addEventListener('click', function(e) {
    const target = e.target.closest('.button');
    
    if (target) {
        const text = target.querySelector('.button__text')?.textContent.toLowerCase();
        
        if (text?.includes('sessões')) {
            alert('Funcionalidade de sessões ativas será implementada em breve.');
        } else if (text?.includes('histórico')) {
            alert('Funcionalidade de histórico de login será implementada em breve.');
        } else if (text?.includes('exportar')) {
            alert('Funcionalidade de exportação de dados será implementada em breve.');
        } else if (text?.includes('limpar')) {
            if (confirm('Deseja limpar o cache?')) {
                alert('Cache limpo com sucesso!');
            }
        }
    }
});
