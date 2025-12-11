/**
 * JVM Launchpad - Dashboard Script
 * Gerencia a área logada do usuário
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
                return item ? JSON.parse(item) : null;
            } catch (e) {
                return null;
            }
        },
        
        clear: () => {
            localStorage.removeItem(CONFIG.TOKEN_KEY);
            localStorage.removeItem(CONFIG.USER_KEY);
        }
    };

    // ==========================================
    // Elementos do DOM
    // ==========================================
    const elements = {
        userName: document.getElementById('userName'),
        userAvatar: document.getElementById('userAvatar'),
        dashboardName: document.getElementById('dashboardName'),
        infoName: document.getElementById('infoName'),
        infoEmail: document.getElementById('infoEmail'),
        infoId: document.getElementById('infoId'),
        lastAccess: document.getElementById('lastAccess'),
        logoutBtn: document.getElementById('logoutBtn'),
        refreshBtn: document.getElementById('refreshBtn')
    };

    // ==========================================
    // Funções de Auth
    // ==========================================
    function getToken() {
        return Storage.get(CONFIG.TOKEN_KEY);
    }

    function getUser() {
        return Storage.get(CONFIG.USER_KEY);
    }

    function logout() {
        Storage.clear();
        window.location.href = '/login';
    }

    // ==========================================
    // Verificar Autenticação
    // ==========================================
    function checkAuth() {
        const token = getToken();
        if (!token) {
            window.location.href = '/login';
            return false;
        }
        return true;
    }

    // ==========================================
    // Carregar dados do usuário
    // ==========================================
    function loadUserData() {
        const user = getUser();
        
        if (!user) {
            logout();
            return;
        }

        // Atualizar elementos da UI
        // Para demonstração, vamos usar "Renata" como exemplo se o nome for "Teste"
        const displayName = user.name === 'Teste' ? 'Renata' : user.name;
        const firstName = displayName.split(' ')[0];
        
        if (elements.userName) {
            elements.userName.textContent = firstName;
        }
        
        if (elements.userAvatar) {
            elements.userAvatar.textContent = displayName.charAt(0).toUpperCase();
        }
        
        if (elements.dashboardName) {
            elements.dashboardName.textContent = firstName;
        }
        
        if (elements.infoName) {
            elements.infoName.textContent = user.name;
        }
        
        if (elements.infoEmail) {
            elements.infoEmail.textContent = user.email;
        }
        
        if (elements.infoId) {
            elements.infoId.textContent = user.id;
        }
        
        if (elements.lastAccess) {
            elements.lastAccess.textContent = formatDate(new Date());
        }
    }

    // ==========================================
    // Verificar token no servidor
    // ==========================================
    async function verifyToken() {
        const token = getToken();
        
        if (!token) {
            logout();
            return;
        }

        try {
            const response = await fetch(`${CONFIG.API_URL}/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (!result.success) {
                // Token inválido ou expirado
                logout();
            }
        } catch (error) {
            console.error('Erro ao verificar token:', error);
            // Em caso de erro de rede, manter o usuário logado
            // mas mostrar mensagem
        }
    }

    // ==========================================
    // Formatar data
    // ==========================================
    function formatDate(date) {
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('pt-BR', options);
    }

    // ==========================================
    // Animação de refresh
    // ==========================================
    function animateRefresh() {
        if (elements.refreshBtn) {
            elements.refreshBtn.classList.add('is-refreshing');
            setTimeout(() => {
                elements.refreshBtn.classList.remove('is-refreshing');
            }, 1000);
        }
    }

    // ==========================================
    // Handler de refresh
    // ==========================================
    async function handleRefresh() {
        animateRefresh();
        await verifyToken();
        loadUserData();
    }

    // ==========================================
    // Inicialização
    // ==========================================
    function init() {
        // Verificar autenticação
        if (!checkAuth()) return;
        
        // Carregar dados do usuário
        loadUserData();
        
        // Verificar token no servidor
        verifyToken();
        
        // Event listeners
        if (elements.logoutBtn) {
            elements.logoutBtn.addEventListener('click', logout);
        }
        
        if (elements.refreshBtn) {
            elements.refreshBtn.addEventListener('click', handleRefresh);
        }
    }

    // Executar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

