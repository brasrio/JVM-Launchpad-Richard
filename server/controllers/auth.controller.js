const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const emailService = require('../services/email.service');

// JWT Secret fixo (não depende do .env)
const JWT_SECRET = 'jvm_launchpad_secret_key_2024';

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
                JWT_SECRET,
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
                        email: newUser.email,
                        username: newUser.username,
                        phone: newUser.phone,
                        bio: newUser.bio,
                        behaviorProfile: newUser.behaviorProfile,
                        createdAt: newUser.createdAt
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
                JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
            );

            res.json({
                success: true,
                message: 'Login realizado com sucesso',
                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        username: user.username,
                        phone: user.phone,
                        bio: user.bio,
                        behaviorProfile: user.behaviorProfile,
                        createdAt: user.createdAt
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
                        email: user.email,
                        username: user.username,
                        phone: user.phone,
                        bio: user.bio,
                        behaviorProfile: user.behaviorProfile,
                        createdAt: user.createdAt
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
    },

    /**
     * Alterar senha do usuário
     */
    changePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            // Validações
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Senha atual e nova senha são obrigatórias'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'A nova senha deve ter pelo menos 6 caracteres'
                });
            }

            // Buscar usuário
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }

            // Verificar senha atual
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Senha atual incorreta'
                });
            }

            // Hash da nova senha
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Atualizar senha
            await UserModel.updatePassword(userId, hashedPassword);

            res.json({
                success: true,
                message: 'Senha alterada com sucesso'
            });

        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao alterar senha'
            });
        }
    },

    /**
     * Deletar conta do usuário
     */
    deleteAccount: async (req, res) => {
        try {
            const { password } = req.body;
            const userId = req.user.id;

            // Validação
            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: 'Senha é obrigatória para confirmar a exclusão'
                });
            }

            // Buscar usuário
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }

            // Verificar senha
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Senha incorreta'
                });
            }

            // Deletar usuário
            await UserModel.delete(userId);

            res.json({
                success: true,
                message: 'Conta deletada com sucesso'
            });

        } catch (error) {
            console.error('Erro ao deletar conta:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao deletar conta'
            });
        }
    },

    /**
     * Atualizar configurações do usuário
     */
    updateSettings: async (req, res) => {
        try {
            const userId = req.user.id;
            const settings = req.body;

            // Salvar configurações
            await UserModel.updateSettings(userId, settings);

            res.json({
                success: true,
                message: 'Configurações salvas com sucesso'
            });

        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao salvar configurações'
            });
        }
    },

    /**
     * Obter configurações do usuário
     */
    getSettings: async (req, res) => {
        try {
            const userId = req.user.id;
            const settings = await UserModel.getSettings(userId);

            res.json({
                success: true,
                data: settings || {}
            });

        } catch (error) {
            console.error('Erro ao obter configurações:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao obter configurações'
            });
        }
    },

    /**
     * Atualizar perfil do usuário
     */
    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const { name, username, phone, bio, behaviorProfile } = req.body;

            // Atualizar dados
            const updatedUser = await UserModel.update(userId, {
                name,
                username,
                phone,
                bio,
                behaviorProfile
            });

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Perfil atualizado com sucesso',
                data: {
                    user: {
                        id: updatedUser.id,
                        name: updatedUser.name,
                        email: updatedUser.email,
                        username: updatedUser.username,
                        phone: updatedUser.phone,
                        bio: updatedUser.bio,
                        behaviorProfile: updatedUser.behaviorProfile,
                        createdAt: updatedUser.createdAt
                    }
                }
            });

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao atualizar perfil'
            });
        }
    },

    /**
     * Obter dados do perfil do usuário
     */
    getProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await UserModel.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }

            res.json({
                success: true,
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    phone: user.phone,
                    bio: user.bio,
                    behaviorProfile: user.behaviorProfile,
                    createdAt: user.createdAt,
                    avatarUrl: user.avatarUrl
                }
            });

        } catch (error) {
            console.error('Erro ao obter perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao obter perfil'
            });
        }
    },

    /**
     * Atualizar avatar do usuário
     */
    updateAvatar: async (req, res) => {
        try {
            const userId = req.user.id;
            const { avatarUrl } = req.body;

            if (!avatarUrl) {
                return res.status(400).json({
                    success: false,
                    message: 'Avatar é obrigatório'
                });
            }

            // Verificar se é base64 válido
            if (!avatarUrl.startsWith('data:image/')) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de imagem inválido'
                });
            }

            // Verificar tamanho (max ~500KB em base64)
            if (avatarUrl.length > 700000) {
                return res.status(400).json({
                    success: false,
                    message: 'Imagem muito grande. Tente uma imagem menor.'
                });
            }

            // Atualizar avatar no banco
            await UserModel.update(userId, { avatarUrl });

            res.json({
                success: true,
                message: 'Avatar atualizado com sucesso'
            });

        } catch (error) {
            console.error('Erro ao atualizar avatar:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao atualizar avatar'
            });
        }
    },

    /**
     * Solicitar recuperação de senha (envia código por email)
     */
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email é obrigatório'
                });
            }

            // Verificar se usuário existe
            const user = await UserModel.findByEmail(email);
            if (!user) {
                // Por segurança, não revelar se o email existe ou não
                return res.json({
                    success: true,
                    message: 'Se o email estiver cadastrado, você receberá um código de recuperação'
                });
            }

            // Gerar código de 6 dígitos
            const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
            const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

            // Salvar código no usuário
            await UserModel.update(user.id, {
                resetCode,
                resetCodeExpires: resetCodeExpires.toISOString()
            });

            // Enviar email com o código
            await emailService.sendPasswordResetCode(email, user.name, resetCode);

            res.json({
                success: true,
                message: 'Código de recuperação enviado para o email'
            });

        } catch (error) {
            console.error('Erro ao solicitar recuperação:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao processar solicitação'
            });
        }
    },

    /**
     * Verificar código de recuperação
     */
    verifyResetCode: async (req, res) => {
        try {
            const { email, code } = req.body;

            if (!email || !code) {
                return res.status(400).json({
                    success: false,
                    message: 'Email e código são obrigatórios'
                });
            }

            // Buscar usuário
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Código inválido ou expirado'
                });
            }

            // Verificar código
            if (user.resetCode !== code) {
                return res.status(400).json({
                    success: false,
                    message: 'Código inválido'
                });
            }

            // Verificar expiração
            if (new Date() > new Date(user.resetCodeExpires)) {
                return res.status(400).json({
                    success: false,
                    message: 'Código expirado. Solicite um novo.'
                });
            }

            // Gerar token de reset para próxima etapa
            const resetToken = jwt.sign(
                { id: user.id, email: user.email, type: 'reset' },
                JWT_SECRET,
                { expiresIn: '15m' }
            );

            res.json({
                success: true,
                message: 'Código verificado com sucesso',
                data: { resetToken }
            });

        } catch (error) {
            console.error('Erro ao verificar código:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao verificar código'
            });
        }
    },

    /**
     * Redefinir senha com token
     */
    resetPassword: async (req, res) => {
        try {
            const { email, resetToken, newPassword } = req.body;

            if (!email || !resetToken || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados incompletos'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'A senha deve ter pelo menos 6 caracteres'
                });
            }

            // Verificar token
            let decoded;
            try {
                decoded = jwt.verify(resetToken, JWT_SECRET);
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: 'Token inválido ou expirado. Solicite um novo código.'
                });
            }

            if (decoded.type !== 'reset' || decoded.email !== email) {
                return res.status(400).json({
                    success: false,
                    message: 'Token inválido'
                });
            }

            // Buscar usuário
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }

            // Hash da nova senha
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Atualizar senha e limpar código de reset
            await UserModel.update(user.id, {
                password: hashedPassword,
                resetCode: null,
                resetCodeExpires: null
            });

            res.json({
                success: true,
                message: 'Senha alterada com sucesso'
            });

        } catch (error) {
            console.error('Erro ao redefinir senha:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao redefinir senha'
            });
        }
    }
};

module.exports = AuthController;
