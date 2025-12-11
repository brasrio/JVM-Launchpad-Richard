/**
 * JVM Launchpad - Profile Page Script
 * Gerencia o perfil do usuário
 */

// Configuração - Usar as mesmas chaves do resto da aplicação
const CONFIG = {
    API_URL: '/api/auth',
    TOKEN_KEY: 'jvm_token',
    USER_KEY: 'jvm_user'
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
    loadUserData();
    loadHeaderAvatar();
    loadProfileFromServer();
    setupFormHandlers();
    setupPasswordToggles();
    setupLogoutHandler();
    setupProfileDataHandler();
    setupAvatarUpload();
}

// ==========================================
// Carregar Avatar do Header
// ==========================================
function loadHeaderAvatar() {
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
// Carregar dados do usuário do localStorage
// ==========================================
function loadUserData() {
    const user = JSON.parse(localStorage.getItem(CONFIG.USER_KEY) || '{}');

    if (user.name) {
        const displayName = user.name;
        const displayEmail = user.email;
        
        // Update profile header
        const profileName = document.getElementById('profileName');
        if (profileName) profileName.textContent = displayName;
        
        const profileEmail = document.getElementById('profileEmail');
        if (profileEmail) profileEmail.textContent = displayEmail || '';
        
        // Set avatar initials or image
        const nameParts = displayName.split(' ');
        const initials = nameParts.length > 1 
            ? nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
            : nameParts[0].substring(0, 2);
        
        // Update avatar display
        updateAvatarDisplay(user.avatarUrl, initials.toUpperCase());

        // Update username link
        const usernameElement = document.getElementById('profileUsername');
        if (usernameElement) {
            const username = user.username || user.name.toLowerCase().replace(/\s+/g, '');
            usernameElement.textContent = '@' + username;
            usernameElement.href = '/user/' + username;
        }

        // Populate form fields
        const fullNameInput = document.getElementById('fullName');
        if (fullNameInput) fullNameInput.value = user.name;
        
        const emailInput = document.getElementById('email');
        if (emailInput) emailInput.value = user.email || '';
        
        const usernameInput = document.getElementById('username');
        if (usernameInput) usernameInput.value = user.username || '';
        
        const phoneInput = document.getElementById('phone');
        if (phoneInput) phoneInput.value = user.phone || '';
        
        const bioInput = document.getElementById('bio');
        if (bioInput) bioInput.value = user.bio || '';

        // Profile Data section
        const profilePhone = document.getElementById('profilePhone');
        if (profilePhone) profilePhone.value = user.phone || '';
        
        const profileBehavior = document.getElementById('profileBehavior');
        if (profileBehavior) profileBehavior.value = user.behaviorProfile || '';
        
        // Created At
        const profileCreatedAt = document.getElementById('profileCreatedAt');
        if (profileCreatedAt && user.createdAt) {
            profileCreatedAt.textContent = formatDate(user.createdAt);
        }
    }
}

// ==========================================
// Atualizar exibição do avatar
// ==========================================
function updateAvatarDisplay(avatarUrl, initials) {
    const avatarInitials = document.getElementById('avatarInitials');
    const avatarImage = document.getElementById('avatarImage');
    
    if (avatarUrl) {
        // Mostrar imagem
        if (avatarImage) {
            avatarImage.src = avatarUrl;
            avatarImage.style.display = 'block';
        }
        if (avatarInitials) {
            avatarInitials.style.display = 'none';
        }
    } else {
        // Mostrar iniciais
        if (avatarInitials) {
            avatarInitials.textContent = initials;
            avatarInitials.style.display = 'flex';
        }
        if (avatarImage) {
            avatarImage.style.display = 'none';
        }
    }
}

// ==========================================
// Carregar dados do perfil do servidor
// ==========================================
async function loadProfileFromServer() {
    try {
        const token = localStorage.getItem(CONFIG.TOKEN_KEY);
        
        if (!token) {
            return; // Apenas usa dados locais
        }
        
        const response = await fetch(`${CONFIG.API_URL}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // Se falhar, apenas usa dados locais (não desloga)
        if (!response.ok) {
            return;
        }

        const result = await response.json();

        if (result.success && result.data) {
            const user = result.data;
            
            // Atualizar localStorage
            const storedUser = JSON.parse(localStorage.getItem(CONFIG.USER_KEY) || '{}');
            const updatedUser = { ...storedUser, ...user };
            localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(updatedUser));

            // Atualizar campos na página
            updateProfileUI(user);
        }
    } catch (error) {
        // Usar dados locais se falhar
    }
}

// ==========================================
// Atualizar UI do perfil
// ==========================================
function updateProfileUI(user) {
    // Profile Data section
    const profilePhone = document.getElementById('profilePhone');
    if (profilePhone) profilePhone.value = user.phone || '';
    
    const profileBehavior = document.getElementById('profileBehavior');
    if (profileBehavior) profileBehavior.value = user.behaviorProfile || '';
    
    const profileEmail = document.getElementById('profileEmail');
    if (profileEmail) profileEmail.textContent = user.email || '';
    
    const profileCreatedAt = document.getElementById('profileCreatedAt');
    if (profileCreatedAt && user.createdAt) {
        profileCreatedAt.textContent = formatDate(user.createdAt);
    }

    // Form fields
    const fullNameInput = document.getElementById('fullName');
    if (fullNameInput && user.name) fullNameInput.value = user.name;
    
    const usernameInput = document.getElementById('username');
    if (usernameInput) usernameInput.value = user.username || '';
    
    const phoneInput = document.getElementById('phone');
    if (phoneInput) phoneInput.value = user.phone || '';
    
    const bioInput = document.getElementById('bio');
    if (bioInput) bioInput.value = user.bio || '';

    // Header elements
    const profileName = document.getElementById('profileName');
    if (profileName && user.name) profileName.textContent = user.name;

    const usernameElement = document.getElementById('profileUsername');
    if (usernameElement && user.name) {
        const username = user.username || user.name.toLowerCase().replace(/\s+/g, '');
        usernameElement.textContent = '@' + username;
    }

    // Avatar
    if (user.name) {
        const nameParts = user.name.split(' ');
        const initials = nameParts.length > 1 
            ? nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
            : nameParts[0].substring(0, 2);
        updateAvatarDisplay(user.avatarUrl, initials.toUpperCase());
    }
}

// ==========================================
// Formatar data
// ==========================================
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// ==========================================
// Setup Profile Data Handler (Dados Pessoais)
// ==========================================
function setupProfileDataHandler() {
    const saveBtn = document.getElementById('saveProfileDataBtn');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSaveProfileData);
    }
}

async function handleSaveProfileData() {
    const phone = document.getElementById('profilePhone')?.value || '';
    const behaviorProfile = document.getElementById('profileBehavior')?.value || '';
    
    const btn = document.getElementById('saveProfileDataBtn');
    const btnText = btn.querySelector('.button__text');
    const btnLoader = btn.querySelector('.button__loader');
    const successAlert = document.getElementById('profileDataSuccess');
    const errorAlert = document.getElementById('profileDataError');
    const successText = document.getElementById('profileDataSuccessText');
    const errorText = document.getElementById('profileDataErrorText');

    // Esconder alertas
    if (successAlert) successAlert.style.display = 'none';
    if (errorAlert) errorAlert.style.display = 'none';

    // Mostrar loading
    btn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline';

    try {
        const token = localStorage.getItem(CONFIG.TOKEN_KEY);
        const user = JSON.parse(localStorage.getItem(CONFIG.USER_KEY) || '{}');
        
        const response = await fetch(`${CONFIG.API_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: user.name,
                phone,
                behaviorProfile
            })
        });

        const result = await response.json();

        if (result.success) {
            // Atualizar localStorage
            const updatedUser = { ...user, phone, behaviorProfile };
            localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(updatedUser));

            // Mostrar sucesso
            if (successText) successText.textContent = 'Dados salvos com sucesso!';
            if (successAlert) successAlert.style.display = 'flex';

            // Atualizar também os campos do formulário de informações pessoais
            const phoneInput = document.getElementById('phone');
            if (phoneInput) phoneInput.value = phone;
        } else {
            if (errorText) errorText.textContent = result.message || 'Erro ao salvar dados';
            if (errorAlert) errorAlert.style.display = 'flex';
        }
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        if (errorText) errorText.textContent = 'Erro de conexão. Tente novamente.';
        if (errorAlert) errorAlert.style.display = 'flex';
    } finally {
        btn.disabled = false;
        if (btnText) btnText.style.display = 'inline';
        if (btnLoader) btnLoader.style.display = 'none';
    }
}

// ==========================================
// Setup form handlers
// ==========================================
function setupFormHandlers() {
    const profileForm = document.getElementById('profileForm');
    const cancelBtn = document.getElementById('cancelBtn');

    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', handleCancel);
    }

    // Change password button
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            window.location.href = '/settings';
        });
    }
}

// ==========================================
// Handle profile update (Informações Pessoais form)
// ==========================================
async function handleProfileUpdate(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('saveBtn');
    const btnText = submitBtn.querySelector('.button__text');
    const loader = submitBtn.querySelector('.button__loader');
    const errorAlert = document.getElementById('errorAlert');
    const successAlert = document.getElementById('successAlert');
    const errorText = document.getElementById('errorText');
    const successText = document.getElementById('successText');

    // Hide alerts
    if (errorAlert) errorAlert.style.display = 'none';
    if (successAlert) successAlert.style.display = 'none';

    // Show loading
    submitBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (loader) loader.style.display = 'block';

    const formData = {
        name: document.getElementById('fullName')?.value || '',
        username: document.getElementById('username')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        bio: document.getElementById('bio')?.value || ''
    };

    try {
        const token = localStorage.getItem(CONFIG.TOKEN_KEY);
        
        const response = await fetch(`${CONFIG.API_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            // Atualizar localStorage
            const user = JSON.parse(localStorage.getItem(CONFIG.USER_KEY) || '{}');
            const updatedUser = { ...user, ...formData };
            localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(updatedUser));

            // Atualizar UI
            updateProfileUI(updatedUser);

            // Show success
            if (successText) successText.textContent = 'Perfil atualizado com sucesso!';
            if (successAlert) successAlert.style.display = 'flex';

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            if (errorText) errorText.textContent = result.message || 'Erro ao atualizar perfil';
            if (errorAlert) errorAlert.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        if (errorText) errorText.textContent = 'Erro de conexão. Tente novamente.';
        if (errorAlert) errorAlert.style.display = 'flex';
    } finally {
        submitBtn.disabled = false;
        if (btnText) btnText.style.display = 'block';
        if (loader) loader.style.display = 'none';
    }
}

// ==========================================
// Handle cancel
// ==========================================
function handleCancel() {
    if (confirm('Descartar alterações?')) {
        loadUserData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ==========================================
// Setup password toggles
// ==========================================
function setupPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.form__toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input && input.type === 'password') {
                input.type = 'text';
                this.textContent = '🙈';
            } else if (input) {
                input.type = 'password';
                this.textContent = '👁';
            }
        });
    });
}

// ==========================================
// Setup logout handler
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
// Setup Avatar Upload
// ==========================================
function setupAvatarUpload() {
    const avatarEditBtn = document.getElementById('avatarEditBtn');
    const avatarInput = document.getElementById('avatarInput');
    
    if (avatarEditBtn && avatarInput) {
        // Ao clicar no botão de editar, abre o seletor de arquivo
        avatarEditBtn.addEventListener('click', () => {
            avatarInput.click();
        });
        
        // Ao selecionar arquivo
        avatarInput.addEventListener('change', handleAvatarSelect);
    }
}

// ==========================================
// Handle Avatar Selection
// ==========================================
async function handleAvatarSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validar tipo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        alert('Formato inválido. Use JPG, PNG ou WebP.');
        return;
    }
    
    // Validar tamanho inicial (max 10MB antes de comprimir)
    if (file.size > 10 * 1024 * 1024) {
        alert('Imagem muito grande. Máximo 10MB.');
        return;
    }
    
    const loading = document.getElementById('avatarLoading');
    if (loading) loading.style.display = 'block';
    
    try {
        // Comprimir imagem
        const compressedBase64 = await compressImage(file, 200, 0.8);
        
        // Enviar para o servidor
        await uploadAvatar(compressedBase64);
        
    } catch (error) {
        alert('Erro ao processar imagem. Tente novamente.');
    } finally {
        if (loading) loading.style.display = 'none';
        // Limpar input
        e.target.value = '';
    }
}

// ==========================================
// Compress Image using Canvas
// ==========================================
function compressImage(file, maxSizeKB, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calcular dimensões (max 400x400 para avatar)
                let width = img.width;
                let height = img.height;
                const maxDim = 400;
                
                if (width > height) {
                    if (width > maxDim) {
                        height = Math.round(height * maxDim / width);
                        width = maxDim;
                    }
                } else {
                    if (height > maxDim) {
                        width = Math.round(width * maxDim / height);
                        height = maxDim;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Desenhar imagem redimensionada
                ctx.drawImage(img, 0, 0, width, height);
                
                // Tentar comprimir até atingir tamanho desejado
                let currentQuality = quality;
                let result = canvas.toDataURL('image/jpeg', currentQuality);
                
                // Reduzir qualidade se necessário (limite de 200KB)
                while (result.length > maxSizeKB * 1024 * 1.37 && currentQuality > 0.1) {
                    currentQuality -= 0.1;
                    result = canvas.toDataURL('image/jpeg', currentQuality);
                }
                
                resolve(result);
            };
            
            img.onerror = reject;
            img.src = e.target.result;
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ==========================================
// Upload Avatar to Server
// ==========================================
async function uploadAvatar(base64Image) {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    
    if (!token) {
        alert('Erro: você precisa estar logado para alterar a foto.');
        return;
    }
    
    const response = await fetch(`${CONFIG.API_URL}/avatar`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ avatarUrl: base64Image })
    });
    
    const result = await response.json();
    
    if (result.success) {
        // Atualizar localStorage
        const user = JSON.parse(localStorage.getItem(CONFIG.USER_KEY) || '{}');
        user.avatarUrl = base64Image;
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
        
        // Atualizar UI do avatar principal
        const nameParts = (user.name || 'U').split(' ');
        const initials = nameParts.length > 1 
            ? nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
            : nameParts[0].substring(0, 2);
        updateAvatarDisplay(base64Image, initials.toUpperCase());
        
        // Atualizar avatar do header
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            userAvatar.innerHTML = `<img src="${base64Image}" alt="Avatar" class="header__avatar-img">`;
        }
        
        // Mostrar feedback de sucesso
        alert('Foto de perfil atualizada com sucesso!');
    } else {
        throw new Error(result.message || 'Erro ao salvar avatar');
    }
}
