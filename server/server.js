require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

