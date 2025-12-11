/**
 * JVM Launchpad - Global Theme Script
 * Este script deve ser carregado em TODAS as páginas antes do conteúdo
 * para evitar flash de tema incorreto
 */

(function() {
    'use strict';

    const SETTINGS_KEY = 'jvm_settings';

    // Carregar configurações
    function loadSettings() {
        try {
            const settings = localStorage.getItem(SETTINGS_KEY);
            return settings ? JSON.parse(settings) : {};
        } catch (e) {
            return {};
        }
    }

    // Aplicar tema
    function applyTheme(isDark) {
        if (isDark === false) {
            document.documentElement.classList.add('light-mode');
            document.body?.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light-mode');
            document.body?.classList.remove('light-mode');
        }
    }

    // Aplicar animações
    function applyAnimations(enabled) {
        if (enabled === false) {
            document.documentElement.classList.add('no-animations');
            document.body?.classList.add('no-animations');
        } else {
            document.documentElement.classList.remove('no-animations');
            document.body?.classList.remove('no-animations');
        }
    }

    // Aplicar todas as configurações visuais
    function applyVisualSettings() {
        const settings = loadSettings();
        applyTheme(settings.darkMode);
        applyAnimations(settings.animations);
    }

    // Aplicar imediatamente (antes do DOM carregar)
    applyVisualSettings();

    // Aplicar novamente quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyVisualSettings);
    }

    // Expor função globalmente para outras páginas poderem atualizar
    window.JVMTheme = {
        apply: applyVisualSettings,
        setDarkMode: function(isDark) {
            const settings = loadSettings();
            settings.darkMode = isDark;
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
            applyTheme(isDark);
        },
        setAnimations: function(enabled) {
            const settings = loadSettings();
            settings.animations = enabled;
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
            applyAnimations(enabled);
        }
    };
})();
