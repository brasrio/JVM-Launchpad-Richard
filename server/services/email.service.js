const nodemailer = require('nodemailer');

/**
 * Serviço de Email - JVM Launchpad
 * Responsável por enviar emails usando Gmail SMTP
 */
class EmailService {
    constructor() {
        this.transporter = null;
        this.initialize();
    }

    /**
     * Inicializa o transporter do Nodemailer
     */
    initialize() {
        try {
            // Verificar se as credenciais de email estão configuradas
            if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                console.warn('⚠️  Configurações de email não encontradas. Emails não serão enviados.');
                return;
            }

            this.transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: parseInt(process.env.EMAIL_PORT || '587'),
                secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para outros
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            console.log('✅ Serviço de email inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar serviço de email:', error);
        }
    }

    /**
     * Envia email de boas-vindas para novo usuário
     * @param {string} email - Email do destinatário
     * @param {string} name - Nome do usuário
     */
    async sendWelcomeEmail(email, name) {
        if (!this.transporter) {
            console.warn('⚠️  Email não enviado: transporter não configurado');
            return { success: false, message: 'Email service not configured' };
        }

        try {
            const mailOptions = {
                from: {
                    name: 'JVM Launchpad',
                    address: process.env.EMAIL_USER
                },
                to: email,
                subject: '🚀 Bem-vindo ao JVM Launchpad!',
                html: this.getWelcomeEmailTemplate(name)
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email de boas-vindas enviado:', info.messageId);
            
            return { 
                success: true, 
                messageId: info.messageId 
            };
        } catch (error) {
            console.error('❌ Erro ao enviar email de boas-vindas:', error);
            return { 
                success: false, 
                error: error.message 
            };
        }
    }

    /**
     * Template HTML do email de boas-vindas
     * @param {string} name - Nome do usuário
     * @returns {string} HTML do email
     */
    getWelcomeEmailTemplate(name) {
        return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo ao JVM Launchpad</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
        <tr>
            <td align="center">
                <!-- Container Principal -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111111; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden;">
                    
                    <!-- Header com Logo -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 40px 30px; text-align: center; border-bottom: 2px solid #e63946;">
                            <div style="font-size: 48px; margin-bottom: 10px;">◆</div>
                            <h1 style="margin: 0; font-size: 32px; color: #ffffff; font-weight: 700;">
                                JVM<span style="color: #e63946;">Launchpad</span>
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Conteúdo Principal -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <!-- Badge de Boas-vindas -->
                            <div style="display: inline-block; background-color: rgba(230, 57, 70, 0.1); border: 1px solid #e63946; border-radius: 20px; padding: 8px 16px; margin-bottom: 24px;">
                                <span style="color: #e63946; font-size: 14px; font-weight: 500;">🎉 Conta Criada com Sucesso</span>
                            </div>
                            
                            <!-- Saudação -->
                            <h2 style="margin: 0 0 16px 0; font-size: 28px; color: #ffffff; font-weight: 700;">
                                Olá, ${name}!
                            </h2>
                            
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #a0a0a0;">
                                Seja muito bem-vindo ao <strong style="color: #e63946;">JVM Launchpad</strong>! 
                                Estamos muito felizes em tê-lo(a) conosco.
                            </p>
                            
                            <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #a0a0a0;">
                                Sua conta foi criada com sucesso e você já pode começar a utilizar 
                                nossa plataforma de autenticação segura e minimalista.
                            </p>
                            
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="${process.env.APP_URL || 'http://localhost:3000'}/dashboard" 
                                           style="display: inline-block; background-color: #e63946; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; transition: background-color 0.3s;">
                                            Acessar Dashboard →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Features -->
                            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #2a2a2a;">
                                <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #ffffff; font-weight: 600;">
                                    O que você pode fazer agora:
                                </h3>
                                
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 12px 0;">
                                            <span style="color: #e63946; font-size: 20px; margin-right: 12px;">🔐</span>
                                            <span style="color: #a0a0a0; font-size: 15px;">Gerenciar suas configurações de segurança</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0;">
                                            <span style="color: #e63946; font-size: 20px; margin-right: 12px;">👤</span>
                                            <span style="color: #a0a0a0; font-size: 15px;">Personalizar seu perfil</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0;">
                                            <span style="color: #e63946; font-size: 20px; margin-right: 12px;">⚡</span>
                                            <span style="color: #a0a0a0; font-size: 15px;">Acessar recursos rápidos e eficientes</span>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0d0d0d; padding: 30px; text-align: center; border-top: 1px solid #2a2a2a;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">
                                Se você não criou esta conta, por favor ignore este email.
                            </p>
                            <p style="margin: 0 0 20px 0; font-size: 14px; color: #666666;">
                                © 2024 JVM Launchpad. Todos os direitos reservados.
                            </p>
                            <div style="margin-top: 20px;">
                                <a href="${process.env.APP_URL || 'http://localhost:3000'}/about" 
                                   style="color: #e63946; text-decoration: none; font-size: 14px; margin: 0 10px;">
                                    Sobre
                                </a>
                                <span style="color: #666666;">•</span>
                                <a href="${process.env.APP_URL || 'http://localhost:3000'}/settings" 
                                   style="color: #e63946; text-decoration: none; font-size: 14px; margin: 0 10px;">
                                    Configurações
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;
    }

    /**
     * Envia email de recuperação de senha
     * @param {string} email - Email do destinatário
     * @param {string} resetToken - Token de recuperação
     */
    async sendPasswordResetEmail(email, resetToken) {
        if (!this.transporter) {
            console.warn('⚠️  Email não enviado: transporter não configurado');
            return { success: false, message: 'Email service not configured' };
        }

        try {
            const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
            
            const mailOptions = {
                from: {
                    name: 'JVM Launchpad',
                    address: process.env.EMAIL_USER
                },
                to: email,
                subject: '🔑 Recuperação de Senha - JVM Launchpad',
                html: `
                    <h2>Recuperação de Senha</h2>
                    <p>Você solicitou a recuperação de senha.</p>
                    <p>Clique no link abaixo para redefinir sua senha:</p>
                    <a href="${resetUrl}">${resetUrl}</a>
                    <p>Este link expira em 1 hora.</p>
                    <p>Se você não solicitou esta recuperação, ignore este email.</p>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email de recuperação enviado:', info.messageId);
            
            return { 
                success: true, 
                messageId: info.messageId 
            };
        } catch (error) {
            console.error('❌ Erro ao enviar email de recuperação:', error);
            return { 
                success: false, 
                error: error.message 
            };
        }
    }
}

// Exportar instância única (Singleton)
module.exports = new EmailService();
