# JVM Launchpad

![JVM Launchpad](public/assets/og-image.svg)

Sistema de autenticação minimalista com design em tons de preto e vermelho.

## 🚀 Tecnologias

### Frontend
- HTML5 semântico
- CSS3 com metodologia BEM
- JavaScript puro (Vanilla JS)
- Design responsivo

### Backend
- Node.js
- Express.js
- JWT (JSON Web Tokens)
- bcryptjs (hash de senhas)

## 📁 Estrutura do Projeto

```
JVM-Launchpad/
├── public/                  # Frontend
│   ├── assets/             # Imagens e ícones
│   │   ├── favicon.svg     # Favicon do site
│   │   ├── logo.svg        # Logo horizontal
│   │   └── og-image.svg    # Imagem para redes sociais
│   ├── css/
│   │   └── styles.css      # Estilos (BEM methodology)
│   ├── js/
│   │   ├── app.js          # Script principal
│   │   ├── auth.js         # Login e registro
│   │   └── dashboard.js    # Área logada
│   ├── index.html          # Página inicial
│   ├── login.html          # Página de login
│   ├── register.html       # Página de cadastro
│   └── dashboard.html      # Painel do usuário
├── server/                  # Backend
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   └── user.model.js
│   ├── routes/
│   │   └── auth.routes.js
│   └── server.js           # Servidor Express
├── package.json
└── README.md
```

## ⚙️ Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd JVM-Launchpad
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:
```env
PORT=3000
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=24h
```

4. **Inicie o servidor**
```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

5. **Acesse o site**
```
http://localhost:3000
```

## 🔌 API Endpoints

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Cadastro de usuário |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/verify` | Verificar token (protegido) |
| POST | `/api/auth/logout` | Logout (protegido) |

### Exemplos de Requisição

**Registro:**
```json
POST /api/auth/register
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Login:**
```json
POST /api/auth/login
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "uuid-do-usuario",
      "name": "João Silva",
      "email": "joao@email.com"
    },
    "token": "jwt-token-aqui"
  }
}
```

## 🔐 Segurança

- Senhas hasheadas com bcrypt (salt rounds: 10)
- Autenticação via JWT
- Tokens com expiração configurável
- Validação de dados no servidor

## 🎨 Design

- **Paleta de cores:** Preto (#0a0a0a) e Vermelho (#e63946)
- **Tipografia:** Orbitron (display) + Rajdhani (body)
- **Metodologia CSS:** BEM (Block Element Modifier)
- **Responsivo:** Mobile-first

## 📝 Licença

ISC License
