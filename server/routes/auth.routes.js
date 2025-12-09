const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rotas públicas
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Rotas protegidas (requerem autenticação)
router.get('/verify', authMiddleware, AuthController.verify);
router.post('/logout', authMiddleware, AuthController.logout);

module.exports = router;

