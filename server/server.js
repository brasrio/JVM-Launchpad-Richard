const path = require('path');

// Carregar variáveis de ambiente do arquivo .env na raiz do projeto
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');

// Debug: mostrar se as variáveis foram carregadas (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
    console.log('🔧 Variáveis de ambiente carregadas:');
    console.log('   - FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅ Configurado' : '❌ Não encontrado');
    console.log('   - FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ Configurado' : '❌ Não encontrado');
    console.log('   - FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅ Configurado' : '❌ Não encontrado');
    console.log('   - JWT_SECRET:', process.env.JWT_SECRET ? '✅ Configurado' : '❌ Não encontrado');
    console.log('   - EMAIL_USER:', process.env.EMAIL_USER ? '✅ Configurado' : '❌ Não encontrado');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' })); // Aumentado para suportar avatar base64
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../public')));

// Rotas da API
app.use('/api/auth', authRoutes);

// Rota para página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Rota para login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Rota para registro
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
});

// Rota para dashboard (área protegida)
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Rota para perfil (área protegida)
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/profile.html'));
});

// Rota para configurações (área protegida)
app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/settings.html'));
});

// Rota para sobre
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/about.html'));
});

// Rota para recuperação de senha
app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/forgot-password.html'));
});

// Rota 404 - deve ser a última rota específica
app.get('/404', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/404.html'));
});

// Middleware para remover .html das URLs se presente
app.use((req, res, next) => {
    if (req.path.endsWith('.html') && req.path !== '/404.html') {
        const newPath = req.path.slice(0, -5); // Remove .html
        res.redirect(301, newPath);
    } else {
        next();
    }
});

// Rota catch-all para páginas não encontradas
app.get('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
    });
});

// Iniciar servidor (apenas quando executado diretamente, não no Vercel)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`
    ╔═══════════════════════════════════════════╗
    ║                                           ║
    ║       🚀 JVM Launchpad Server 🚀          ║
    ║                                           ║
    ║   Servidor rodando na porta ${PORT}          ║
    ║   http://localhost:${PORT}                   ║
    ║                                           ║
    ╚═══════════════════════════════════════════╝
        `);
    });
}

// Exportar para Vercel
module.exports = app;

