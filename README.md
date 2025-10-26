# goOut - LinkedIn para Hobbies

> Encontre amigos para fazer aquilo que move a vida. Conecte-se com pessoas para praticar hobbies.

## 📋 Stack Tecnológica

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod
- **State Management**: TanStack Query

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20.x LTS (recomendado usar [nvm](https://github.com/nvm-sh/nvm))
- npm ou yarn

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

## 🎨 Design System

O projeto utiliza um design system customizado baseado em:
- **Paleta**: Burnt Red (#B6463A) como cor primária sobre fundo branco limpo
- **Tipografia**: Red Hat Display
- **Componentes**: shadcn/ui com customizações
- **Tokens**: Todas as cores definidas como HSL no `index.css`

Ver `src/index.css` e `tailwind.config.ts` para configurações detalhadas.

## 📊 Checklist de Avaliação

### ✅ Clean Code
- [x] TypeScript strict mode habilitado
- [x] ESLint configurado com regras rigorosas
- [x] Prettier para formatação consistente
- [x] Imports organizados e sem código morto
- [x] Nomes de variáveis/funções descritivos
- [x] Componentes focados e reutilizáveis
- [x] Types compartilhados em `src/types/`

### ✅ Segurança
- [x] `.env` no .gitignore, apenas `.env.example` commitado
- [x] CSP configurado no index.html
- [x] Sem uso de `dangerouslySetInnerHTML` exceto em casos controlados
- [x] Validação de entrada com Zod
- [x] RLS habilitado em todas as tabelas Supabase

### ✅ Performance
- [x] Code splitting por rotas (React Router)
- [x] Imports direcionados (ex: `date-fns/format`)
- [x] Lazy loading de componentes pesados
- [x] Otimização de imagens via Supabase Storage

### ✅ Apresentação
- [x] README completo e estruturado
- [x] CHANGELOG documentando mudanças
- [x] CI/CD básico configurado
- [x] .editorconfig para consistência
- [x] Documentação de setup clara

## 🔧 Métricas de Build

Após o último build (exemplo):
```
Build completed
dist/ size: ~X MB
Total files: ~XX
Warnings: 0
```

## 🤝 Contribuindo

1. Clone o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- Use TypeScript para todos os novos arquivos
- Siga as regras do ESLint
- Execute `npm run format` antes de commitar
- Mantenha componentes pequenos e focados
- Adicione types apropriados (evite `any`)

## 📝 Licença

Este projeto foi desenvolvido para uso privado.

## 🔗 Links Úteis

- [Lovable Project Dashboard](https://lovable.dev/projects/4ca1593d-8d28-4273-9432-cacdf6428fcc)
- [Supabase Dashboard](https://app.supabase.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

## 📞 Suporte

Para questões ou problemas, abra uma issue no repositório.
