/**
 * User Model - Suporta Firebase Firestore e fallback em memória
 */

const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/firebase');

// Armazenamento em memória (fallback para desenvolvimento sem Firebase)
const memoryUsers = [];

// Nome da coleção no Firestore
const COLLECTION = 'users';

/**
 * Verifica se o Firebase está disponível
 */
const isFirebaseAvailable = () => db !== null;

const UserModel = {
    /**
     * Criar novo usuário
     */
    create: async (userData) => {
        const newUser = {
            id: uuidv4(),
            name: userData.name,
            email: userData.email.toLowerCase(),
            password: userData.password, // Já vem hasheada do controller
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (isFirebaseAvailable()) {
            // Salvar no Firestore
            await db.collection(COLLECTION).doc(newUser.id).set(newUser);
        } else {
            // Fallback: salvar em memória
            memoryUsers.push(newUser);
        }

        return newUser;
    },

    /**
     * Buscar usuário por email
     */
    findByEmail: async (email) => {
        const normalizedEmail = email.toLowerCase();

        if (isFirebaseAvailable()) {
            const snapshot = await db.collection(COLLECTION)
                .where('email', '==', normalizedEmail)
                .limit(1)
                .get();

            if (snapshot.empty) return null;
            return snapshot.docs[0].data();
        } else {
            return memoryUsers.find(user => user.email === normalizedEmail) || null;
        }
    },

    /**
     * Buscar usuário por ID
     */
    findById: async (id) => {
        if (isFirebaseAvailable()) {
            const doc = await db.collection(COLLECTION).doc(id).get();
            if (!doc.exists) return null;
            return doc.data();
        } else {
            return memoryUsers.find(user => user.id === id) || null;
        }
    },

    /**
     * Listar todos os usuários (sem senhas)
     */
    findAll: async () => {
        let users = [];

        if (isFirebaseAvailable()) {
            const snapshot = await db.collection(COLLECTION).get();
            users = snapshot.docs.map(doc => doc.data());
        } else {
            users = memoryUsers;
        }

        // Remover senhas antes de retornar
        return users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        }));
    },

    /**
     * Atualizar usuário
     */
    update: async (id, updateData) => {
        const updates = {
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        if (isFirebaseAvailable()) {
            const docRef = db.collection(COLLECTION).doc(id);
            const doc = await docRef.get();
            
            if (!doc.exists) return null;

            await docRef.update(updates);
            const updated = await docRef.get();
            return updated.data();
        } else {
            const index = memoryUsers.findIndex(user => user.id === id);
            if (index === -1) return null;

            memoryUsers[index] = { ...memoryUsers[index], ...updates };
            return memoryUsers[index];
        }
    },

    /**
     * Deletar usuário
     */
    delete: async (id) => {
        if (isFirebaseAvailable()) {
            const docRef = db.collection(COLLECTION).doc(id);
            const doc = await docRef.get();

            if (!doc.exists) return false;

            await docRef.delete();
            return true;
        } else {
            const index = memoryUsers.findIndex(user => user.id === id);
            if (index === -1) return false;

            memoryUsers.splice(index, 1);
            return true;
        }
    }
};

module.exports = UserModel;
