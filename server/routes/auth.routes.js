const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rotas públicas
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Recuperação de senha (públicas)
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/verify-reset-code', AuthController.verifyResetCode);
router.post('/reset-password', AuthController.resetPassword);

// Rotas protegidas (requerem autenticação)
router.get('/verify', authMiddleware, AuthController.verify);
router.post('/logout', authMiddleware, AuthController.logout);

// Configurações e segurança
router.post('/change-password', authMiddleware, AuthController.changePassword);
router.post('/delete-account', authMiddleware, AuthController.deleteAccount);
router.get('/settings', authMiddleware, AuthController.getSettings);
router.post('/settings', authMiddleware, AuthController.updateSettings);

// Perfil
router.get('/profile', authMiddleware, AuthController.getProfile);
router.put('/profile', authMiddleware, AuthController.updateProfile);
router.post('/avatar', authMiddleware, AuthController.updateAvatar);

module.exports = router;

