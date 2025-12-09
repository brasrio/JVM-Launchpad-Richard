/**
 * JVM Launchpad - Main Application Script
 * Gerencia funcionalidades gerais do site
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
        
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.error('Erro ao salvar no storage:', e);
            }
        },
        
        remove: (key) => {
            localStorage.removeItem(key);
        },
        
        clear: () => {
            localStorage.removeItem(CONFIG.TOKEN_KEY);
            localStorage.removeItem(CONFIG.USER_KEY);
        }
    };

    // ==========================================
    // Utilitários de Auth
    // ==========================================
    const Auth = {
        isAuthenticated: () => {
            return !!Storage.get(CONFIG.TOKEN_KEY);
        },
        
        getToken: () => {
            return Storage.get(CONFIG.TOKEN_KEY);
        },
        
        getUser: () => {
            return Storage.get(CONFIG.USER_KEY);
        },
        
        logout: () => {
            Storage.clear();
            window.location.href = '/login';
        }
    };

    // ==========================================
    // Atualizar navegação baseado no estado de auth
    // ==========================================
    function updateNavigation() {
        const nav = document.querySelector('.header__nav');
        if (!nav) return;

        if (Auth.isAuthenticated()) {
            const user = Auth.getUser();
            nav.innerHTML = `
                <a href="/dashboard" class="header__link">Dashboard</a>
                <button class="header__link header__link--logout" id="logoutBtn">Sair</button>
            `;
            
            // Adicionar evento de logout
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', Auth.logout);
            }
        }
    }

    // ==========================================
    // Animações de entrada
    // ==========================================
    function initAnimations() {
        // Observador de interseção para animações de scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observar elementos com animação
        document.querySelectorAll('.feature, .hero__content, .hero__visual').forEach(el => {
            observer.observe(el);
        });
    }

    // ==========================================
    // Efeito de digitação no código do hero
    // ==========================================
    function initTypingEffect() {
        const cursor = document.querySelector('.hero__code-line--cursor');
        if (!cursor) return;

        // Piscar cursor
        setInterval(() => {
            cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
        }, 500);
    }

    // ==========================================
    // Inicialização
    // ==========================================
    function init() {
        updateNavigation();
        initAnimations();
        initTypingEffect();
    }

    // Executar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expor utilitários globalmente
    window.JVMLaunchpad = {
        Config: CONFIG,
        Storage,
        Auth
    };

})();

