/**
 * JVM Launchpad - Script de Setup
 * Execute: node setup.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

console.log('');
console.log('╔═══════════════════════════════════════════╗');
console.log('║       🚀 JVM Launchpad Setup 🚀           ║');
console.log('╚═══════════════════════════════════════════╝');
console.log('');

// Verificar se .env existe
if (fs.existsSync(envPath)) {
    console.log('✅ Arquivo .env já existe!');
    console.log('');
    console.log('Se quiser recriar, delete o arquivo .env e execute este script novamente.');
} else {
    // Verificar se env.example existe
    if (fs.existsSync(envExamplePath)) {
        // Copiar env.example para .env
        const envContent = fs.readFileSync(envExamplePath, 'utf8');
        fs.writeFileSync(envPath, envContent);
        
        console.log('✅ Arquivo .env criado com sucesso!');
        console.log('');
        console.log('O arquivo .env foi criado com as configurações do env.example.');
        console.log('');
    } else {
        console.log('❌ Erro: arquivo env.example não encontrado!');
        process.exit(1);
    }
}

// Carregar e verificar as variáveis
require('dotenv').config({ path: envPath });

console.log('📋 Verificando configurações:');
console.log('');

const checks = [
    { name: 'JWT_SECRET', value: process.env.JWT_SECRET },
    { name: 'FIREBASE_PROJECT_ID', value: process.env.FIREBASE_PROJECT_ID },
    { name: 'FIREBASE_CLIENT_EMAIL', value: process.env.FIREBASE_CLIENT_EMAIL },
    { name: 'FIREBASE_PRIVATE_KEY', value: process.env.FIREBASE_PRIVATE_KEY },
    { name: 'EMAIL_USER', value: process.env.EMAIL_USER },
    { name: 'EMAIL_PASS', value: process.env.EMAIL_PASS },
];

let allOk = true;
checks.forEach(check => {
    if (check.value && check.value.length > 0 && !check.value.includes('sua_')) {
        console.log(`   ✅ ${check.name}: Configurado`);
    } else {
        console.log(`   ❌ ${check.name}: NÃO configurado ou usando valor padrão`);
        allOk = false;
    }
});

console.log('');

if (allOk) {
    console.log('🎉 Tudo configurado corretamente!');
    console.log('');
    console.log('Para iniciar o servidor, execute:');
    console.log('   npm start');
    console.log('');
    console.log('Acesse: http://localhost:3000');
} else {
    console.log('⚠️  Algumas configurações precisam ser ajustadas no arquivo .env');
    console.log('');
    console.log('Abra o arquivo .env e configure as variáveis necessárias.');
}

console.log('');
