const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const emailService = require('../services/email.service');

const AuthController = {
    /**
     * Registro de novo usuário
     */
    register: async (req, res) => {
        try {
            const { name, email, password } = req.body;

            // Validações
            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos os campos são obrigatórios'
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'A senha deve ter pelo menos 6 caracteres'
                });
            }

            // Verificar se email já existe
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Este email já está cadastrado'
                });
            }

            // Hash da senha
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Criar usuário
            const newUser = await UserModel.create({
                name,
                email,
                password: hashedPassword
            });

            // Gerar token JWT
            const token = jwt.sign(
                { id: newUser.id, email: newUser.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
            );

            // Enviar email de boas-vindas (não bloqueia a resposta)
            emailService.sendWelcomeEmail(newUser.email, newUser.name)
                .then(result => {
                    if (result.success) {
                        console.log('✅ Email de boas-vindas enviado para:', newUser.email);
                    } else {
                        console.warn('⚠️  Falha ao enviar email de boas-vindas:', result.error);
                    }
                })
                .catch(err => {
                    console.error('❌ Erro ao enviar email de boas-vindas:', err);
                });

            res.status(201).json({
                success: true,
                message: 'Usuário cadastrado com sucesso',
                data: {
                    user: {
                        id: newUser.id,
                        name: newUser.name,
                        email: newUser.email
                    },
                    token
                }
            });

        } catch (error) {
            console.error('Erro no registro:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao cadastrar usuário'
            });
        }
    },

    /**
     * Login de usuário
     */
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Validações
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email e senha são obrigatórios'
                });
            }

            // Buscar usuário
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciais inválidas'
                });
            }

            // Verificar senha
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciais inválidas'
                });
            }

            // Gerar token JWT
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
            );

            res.json({
                success: true,
                message: 'Login realizado com sucesso',
                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    },
                    token
                }
            });

        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao realizar login'
            });
        }
    },

    /**
     * Verificar token e retornar dados do usuário
     */
    verify: async (req, res) => {
        try {
            const user = await UserModel.findById(req.user.id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }

            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    }
                }
            });

        } catch (error) {
            console.error('Erro na verificação:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao verificar usuário'
            });
        }
    },

    /**
     * Logout (invalidação do token no cliente)
     */
    logout: (req, res) => {
        res.json({
            success: true,
            message: 'Logout realizado com sucesso'
        });
    }
};

module.exports = AuthController;
