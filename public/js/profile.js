// Profile Page - JVM Launchpad
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Load user data
    loadUserData();

    // Form handlers
    setupFormHandlers();

    // Toggle password visibility
    setupPasswordToggles();

    // Logout handler
    setupLogoutHandler();
});

// Load user data from token
function loadUserData() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (user.name) {
        // Update profile header
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('profileEmail').textContent = user.email || '';
        
        // Set avatar initial
        const initial = user.name.charAt(0).toUpperCase();
        const avatars = document.querySelectorAll('.profile__avatar, #userAvatar');
        avatars.forEach(avatar => avatar.textContent = initial);

        // Populate form fields
        document.getElementById('fullName').value = user.name;
        document.getElementById('email').value = user.email || '';
        document.getElementById('username').value = user.username || '';
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('bio').value = user.bio || '';
    }
}

// Setup form handlers
function setupFormHandlers() {
    const profileForm = document.getElementById('profileForm');
    const cancelBtn = document.getElementById('cancelBtn');

    profileForm.addEventListener('submit', handleProfileUpdate);
    cancelBtn.addEventListener('click', handleCancel);

    // Change password button
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', handleChangePassword);
    }
}

// Handle profile update
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
    errorAlert.style.display = 'none';
    successAlert.style.display = 'none';

    // Show loading
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    loader.style.display = 'block';

    const formData = {
        name: document.getElementById('fullName').value,
        username: document.getElementById('username').value,
        phone: document.getElementById('phone').value,
        bio: document.getElementById('bio').value
    };

    try {
        const token = localStorage.getItem('token');
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Update local storage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        Object.assign(user, formData);
        localStorage.setItem('user', JSON.stringify(user));

        // Show success
        successText.textContent = 'Perfil atualizado com sucesso!';
        successAlert.style.display = 'flex';

        // Reload user data
        loadUserData();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error updating profile:', error);
        errorText.textContent = 'Erro ao atualizar perfil. Tente novamente.';
        errorAlert.style.display = 'flex';
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        loader.style.display = 'none';
    }
}

// Handle cancel
function handleCancel() {
    if (confirm('Descartar alterações?')) {
        loadUserData(); // Reload original data
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Handle change password
function handleChangePassword() {
    // In a real app, this would open a modal or redirect to password change page
    alert('Funcionalidade de alteração de senha será implementada em breve.');
}

// Setup password toggles
function setupPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.form__toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input && input.type === 'password') {
                input.type = 'text';
                this.textContent = '👁‍🗨';
            } else if (input) {
                input.type = 'password';
                this.textContent = '👁';
            }
        });
    });
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
