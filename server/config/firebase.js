/**
 * Configuração do Firebase Admin SDK
 */

const admin = require('firebase-admin');

// Verificar se já foi inicializado (evita erro em hot reload)
if (!admin.apps.length) {
    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.FIREBASE_PROJECT_ID) {
        console.warn('⚠️  Firebase não configurado. Usando armazenamento em memória.');
    } else {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    // A chave privada vem com \n escapados, precisamos converter
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
                })
            });
            console.log('✅ Firebase inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar Firebase:', error.message);
        }
    }
}

// Exportar Firestore (ou null se não configurado)
const db = admin.apps.length ? admin.firestore() : null;

module.exports = { admin, db };

