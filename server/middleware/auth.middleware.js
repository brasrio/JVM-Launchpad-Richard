const jwt = require('jsonwebtoken');

// JWT Secret fixo (mesmo do controller)
const JWT_SECRET = 'jvm_launchpad_secret_key_2024';

const authMiddleware = (req, res, next) => {
    try {
        // Obter token do header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Token de autenticação não fornecido'
            });
        }

        // Formato esperado: "Bearer TOKEN"
        const parts = authHeader.split(' ');
        
        if (parts.length !== 2) {
            return res.status(401).json({
                success: false,
                message: 'Formato de token inválido'
            });
        }

        const [scheme, token] = parts;

        if (!/^Bearer$/i.test(scheme)) {
            return res.status(401).json({
                success: false,
                message: 'Token mal formatado'
            });
        }

        // Verificar e decodificar token
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: 'Token inválido ou expirado'
                });
            }

            // Adicionar dados do usuário ao request
            req.user = {
                id: decoded.id,
                email: decoded.email
            };

            return next();
        });

    } catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno de autenticação'
        });
    }
};

module.exports = authMiddleware;

