# JVM Launchpad - Páginas do Sistema

Documentação completa de todas as páginas da aplicação.

---

## 📄 Páginas Públicas

### 1. **Landing Page** (`index.html`)
- **Rota**: `/` ou `/index.html`
- **Descrição**: Página inicial com apresentação do sistema
- **Recursos**:
  - Hero section com animações
  - Apresentação de features (Segurança, Velocidade, Simplicidade)
  - CTAs para Login e Cadastro
  - Design minimalista preto e vermelho
- **Script**: `app.js`

### 2. **Sobre** (`about.html`)
- **Rota**: `/about` ou `/about.html`
- **Descrição**: Informações sobre o JVM Launchpad
- **Recursos**:
  - Missão e Visão da plataforma
  - Stack tecnológico utilizado
  - Features de segurança
  - Estatísticas (Uptime, Tempo de resposta, etc.)
  - CTA para registro
- **Script**: `app.js`

---

## 🔐 Páginas de Autenticação

### 3. **Login** (`login.html`)
- **Rota**: `/login` ou `/login.html`
- **Descrição**: Página de login do sistema
- **Recursos**:
  - Formulário de email e senha
  - Toggle para mostrar/ocultar senha
  - Alertas de erro e sucesso
  - Link para cadastro e recuperação de senha
- **Script**: `auth.js`

### 4. **Cadastro** (`register.html`)
- **Rota**: `/register` ou `/register.html`
- **Descrição**: Página de registro de novos usuários
- **Recursos**:
  - Formulário com nome, email, senha e confirmação
  - Indicador de força da senha
  - Validação de senha
  - Toggle para mostrar/ocultar senha
  - Link para login
- **Script**: `auth.js`

### 5. **Recuperar Senha** (`forgot-password.html`)
- **Rota**: `/forgot-password` ou `/forgot-password.html`
- **Descrição**: Página para recuperação de senha
- **Recursos**:
  - Formulário de email
  - Instruções sobre o processo
  - Links para login e cadastro
  - Feedback de envio de email
- **Script**: Inline JavaScript

---

## 🏠 Páginas Protegidas (Requer Autenticação)

### 6. **Dashboard** (`dashboard.html`)
- **Rota**: `/dashboard` ou `/dashboard.html`
- **Descrição**: Painel principal do usuário
- **Recursos**:
  - Cards com status da conta
  - Informações de segurança
  - Último acesso
  - Informações completas da conta
  - Botão de atualizar dados
  - Header com avatar e nome do usuário
- **Script**: `dashboard.js`

### 7. **Perfil** (`profile.html`)
- **Rota**: `/profile` ou `/profile.html`
- **Descrição**: Página de edição de perfil do usuário
- **Recursos**:
  - Avatar personalizável
  - Badge de status da conta
  - Formulário de informações pessoais (nome, username, telefone, bio)
  - Seção de segurança (alterar senha, 2FA)
  - Zona de perigo (desativar/excluir conta)
  - Navegação entre Dashboard, Perfil e Configurações
- **Script**: `profile.js`

### 8. **Configurações** (`settings.html`)
- **Rota**: `/settings` ou `/settings.html`
- **Descrição**: Página de configurações da aplicação
- **Recursos**:
  - **Aparência**: Tema escuro/claro, Animações, Idioma
  - **Notificações**: Email, Push, Alertas de segurança
  - **Privacidade**: Perfil público, Sessões ativas, Histórico de login
  - **Dados**: Exportar dados, Limpar cache, Armazenamento usado
  - Toggles interativos
  - Informações de versão
  - Botões para salvar e restaurar padrões
- **Script**: `settings.js`

---

## ❌ Páginas de Erro

### 9. **Página 404** (`404.html`)
- **Rota**: `/404` ou `/404.html`
- **Descrição**: Página de erro 404 (Não Encontrado)
- **Recursos**:
  - Animação do código 404
  - Card com informações do erro
  - Exibição do path atual
  - Links para páginas principais
  - Botões de navegação
- **Script**: Inline JavaScript

---

## 🎨 Design System

### Cores
- **Background**: `#0a0a0a` (preto principal)
- **Accent**: `#e63946` (vermelho)
- **Accent Hover**: `#ff4757`
- **Texto Primário**: `#ffffff`
- **Texto Secundário**: `#a0a0a0`
- **Sucesso**: `#10b981`
- **Erro**: `#ef4444`

### Tipografia
- **Display**: Orbitron (títulos e logos)
- **Body**: Rajdhani (corpo do texto)

### Componentes Reutilizáveis
- **Buttons**: Primary, Secondary, Danger, Small
- **Forms**: Input, Textarea, Toggle Switch, Password Strength
- **Alerts**: Success, Error
- **Cards**: Dashboard cards, Feature cards
- **Header**: Com logo e navegação
- **Footer**: Simples com copyright

---

## 📂 Estrutura de Arquivos

```
public/
├── index.html              # Landing page
├── login.html              # Login
├── register.html           # Cadastro
├── forgot-password.html    # Recuperar senha
├── dashboard.html          # Dashboard
├── profile.html            # Perfil do usuário
├── settings.html           # Configurações
├── about.html              # Sobre
├── 404.html                # Página de erro
├── css/
│   └── styles.css          # Estilos globais
├── js/
│   ├── app.js              # Script para páginas públicas
│   ├── auth.js             # Script de autenticação
│   ├── dashboard.js        # Script do dashboard
│   ├── profile.js          # Script do perfil
│   └── settings.js         # Script de configurações
└── assets/
    ├── favicon.svg
    ├── logo.svg
    └── og-image.png
```

---

## 🔗 Fluxo de Navegação

```
Landing Page (/)
├── Login (/login)
│   ├── Forgot Password (/forgot-password)
│   └── Register (/register)
├── About (/about)
└── Register (/register)
    └── Login (/login)

Dashboard (/dashboard) [Protegido]
├── Profile (/profile)
│   └── Settings (/settings)
├── Settings (/settings)
│   └── Profile (/profile)
└── Logout → Landing Page (/)
```

---

## 🛡️ Autenticação

### Páginas Públicas
- Landing Page
- About
- Login
- Register
- Forgot Password
- 404

### Páginas Protegidas
- Dashboard
- Profile
- Settings

**Lógica**: Páginas protegidas verificam a presença de token JWT no `localStorage`. Se não encontrado, redirecionam para `/login.html`.

---

## 📱 Responsividade

Todas as páginas são totalmente responsivas com breakpoints:
- **Desktop**: > 992px
- **Tablet**: 768px - 992px
- **Mobile**: < 768px
- **Mobile Small**: < 480px

---

## ✨ Animações

- **Fade In Up**: Entrada suave de elementos
- **Pulse**: Animação de ícones
- **Blink**: Indicadores de status
- **Hover Effects**: Transformações e shadows
- **Loading Spinners**: Feedback de carregamento

---

## 🚀 Próximos Passos

Features a serem implementadas:
- [ ] Upload de avatar personalizado
- [ ] Alterar senha funcional
- [ ] Autenticação de dois fatores (2FA)
- [ ] Histórico de login
- [ ] Gerenciamento de sessões ativas
- [ ] Exportação de dados
- [ ] Temas personalizados
- [ ] Multi-idioma completo

---

Desenvolvido com ❤️ para JVM Launchpad
