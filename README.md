<h1 align="center">Hi 👋, I'm Julia</h1>
<h3 align="center">A marketing specialist passionate by AI and creating</h3>
<p>
</p>
- 🔭 I’m currently working on **Marketing AI Ops**

- 🌱 I’m currently learning **n8n**

- 👯 I’m looking to collaborate on **implamenting strategic AI in companies**

- 🤝 I’m looking for help with **Upskilling in AI and Coding**

- 💬 Ask me about **automations, strategic AI, AI implementation**

- 📫 How to reach me **jlobacci@gmail.com**

- ⚡ Fun fact: **I graduated in Architecture, worked as a Designer, specialized in marketing and I'm currinting shiffiting to facilitade AI implementations for companies**

<h3 align="left">Connect with me:</h3>
<p align="left">
<a href="https://linkedin.com/in/https://www.linkedin.com/in/julia-bacci/" target="blank"><img align="center" src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/linked-in-alt.svg" alt="https://www.linkedin.com/in/julia-bacci/" height="30" width="40" /></a>
</p>

---

![Preview do GoOut](https://goout.lovable.app/assets/logo-BGlrBnz4.png)
<h3 align="center">Mais do que uma rede social!</h3>

<h3 align="center">Um movimento para quem quer viver mais, aprender mais e se conectar de verdade.</h3>
<h4 align="center">Transforme a busca por experiências em momentos inesquecíveis — de festivais a teatros, tudo com IA ao seu lado.</h3>

[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-blueviolet?style=for-the-badge)](https://lovable.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-97.6%25-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-Framework-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**demo**: [https://drive.google.com/file/d/17xGr5_3prxWuW-Om5WmXejU3jcBySIHT/view?usp=sharing)  
**Apresentação**: [https://docs.google.com/presentation/d/1nRk3pvYGghxLWD0sFHE5tBhjKcVgF5ca3H9dbUQOL0s/edit?usp=sharing)


---

## por que existe

O **GoOut** nasceu para te tirar da rotina, te conectar com pessoas e te inspirar a ocupar a cidade com propósito. Uma rede social feita para se conectar com novas pessoas e ocupar a cidade despertando convívio e criatividade.

---

## principais recursos

### 🎭 **Anúncio de eventos publicamente**  
Anuncie atividades que gostaria de fazer, encontre pessoas que estão buscando o mesmo, marquem um dia e ocupem os espaços.

### 🎫 **verificações de segurança**  
Verificação de antecedentes por CPF e checagem de foto com IA, garantindo conexões seguras, experiências reais.

### 📍 **Espaço para pequenos empreendedores**  
Divulgue aulas e atividades em grupos, encontre pessoas buscando por nichos e crie eventos que conectam e geram valor.

### 💾 **Conheça pessoas reais**  
Encontre e se conecte com pessoas que, como você, estão buscando amizades reais.

### 🌐 **multi-região**  
Suporte inicial para Brasil, com expansão planejada para América Latina e Europa. interface adaptável e dados localizados.

### ⚡ **Stack moderna e escalável**  
React + TypeScript + Vite no front; Supabase (auth/db/storage) + integração com APIs de eventos e gateways de pagamento no back.

---

## começar em 5 minutos

### Instalação

```bash
# Clone o repositório
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Use a versão correta do Node (se estiver usando nvm)
nvm use

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Supabase
```

### Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_SUPABASE_PROJECT_ID="seu-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="sua-anon-key"
VITE_SUPABASE_URL="https://seu-project-id.supabase.co"
```

**Importante**: Nunca commite o arquivo `.env` no repositório. Use apenas `.env.example` como template.

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento (http://localhost:8080)

# Build
npm run build            # Build de produção
npm run build:dev        # Build de desenvolvimento

# Linting & Formatação
npm run lint             # Executa ESLint
npm run format           # Formata código com Prettier (adicionar ao package.json)

# Preview
npm run preview          # Preview do build de produção
```

---

## como usar

1. **cadastro/login**  
   crie sua conta ou autentique-se via Email. configure suas preferências culturais iniciais (músicas, gêneros, cidades).

2. **explorar eventos**  
   navegue pela homepage, use a busca ou filtros para descobrir eventos específicos.

3. **Publique eventos**  
   Anuncie o que gosta de fazer e encontre pessoas para somar nas atividades

4. **Envie mensagens**  
   Marque pessoas, comente em publicações, faça perguntas e receba notificações automáticas.

```js
const res = await fetch('https://api.juliagoout.com/events/recommend', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ user_id: '123', location: 'São Paulo', preferences: ['música', 'teatro'] })
});
const recommendations = await res.json();
```

---

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React reutilizáveis
│   ├── ui/             # Componentes UI do shadcn
│   └── ...             # Componentes de negócio
├── contexts/           # React Contexts (Auth, etc)
├── hooks/              # Custom React hooks
├── integrations/       # Integrações externas (Supabase)
├── lib/                # Utilitários e helpers
├── pages/              # Componentes de página/rota
├── types/              # TypeScript types compartilhados
└── index.css           # Estilos globais e design system

supabase/
├── config.toml         # Configuração do Supabase
├── functions/          # Edge Functions
└── migrations/         # Migrações do banco de dados
```

## 🔒 Segurança

- **Variáveis de ambiente**: Todas as credenciais devem estar em `.env` (não commitado)
- **RLS**: Row Level Security habilitado em todas as tabelas do Supabase
- **CSP**: Content Security Policy configurada no `index.html`
- **Validação**: Schemas Zod para validação de entrada

---

## 📋 Stack Tecnológica

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod
- **State Management**: TanStack Query

---

## roadmap

### **fase 1 — MVP (✅ concluído)**

* autenticação e perfil de usuário
* busca básica e filtros
* UI moderna com glassmorphism
* checagem de dados e segurança
* suporte a múltiplas cidades e regiões

### **fase 2 — em desenvolvimento**

* sistema de IA avançado com recomendações personalizadas
* notificações push e emails personalizados
* Checkout para eventos pagos
* Integração via API com Google Calendar

### **fase 3 — futuro**

* app mobile nativo (React Native)
* integração com redes sociais para eventos colaborativos
* marketplace de experiências (workshops, encontros)
* expansão internacional (América Latina, Europa)

---

## diferenciais competitivos

**vs. Outros apps**: foco em mercado brasileiro, gratuito e com foco específico em conectar pessoas para realizar hobbies

**vs. agregadores tradicionais**: experiência unificada sem redirecionamentos

---

## boas práticas

* **privacidade**: dados de usuários anonimizados para treinamento de modelos IA, conformidade com LGPD
* **acessibilidade**: suporte a leitores de tela, contraste adequado, navegação por teclado
* **performance**: lazy loading, caching inteligente, otimização de imagens

---

## contribuir

1. faça fork do projeto
2. crie sua branch: `git checkout -b feature/nova-feature`
3. commit: `git commit -m "feat: adiciona busca por voz"`
4. push: `git push origin feature/nova-feature`
5. abra um pull request

**guidelines**: padronize tipagem TypeScript, adicione testes para novas features, atualize documentação, siga padrões de commits convencionais.

---

## equipe

**Julia Bacci** — desenvolvedor & product lead

* LinkedIn: [https://linkedin.com/in/jlobacci](https://linkedin.com/in/jlobacci)
* GitHub: [https://github.com/jlobacci](https://github.com/jlobacci)
* Email: jlobacci@example.com

---

## licença

MIT — veja [LICENSE](LICENSE).

---

## agradecimentos

Construído durante o **AI Builder Hackathon 2025** com paixão e muito código. Agradecimentos especiais à comunidade Lovable e todos os contribuidores open-source que tornaram este projeto possível.

---

> feito com ❤️ para conectar pessoas a experiências incríveis — porque a vida não acontece só entre a casa e o trabalho.
