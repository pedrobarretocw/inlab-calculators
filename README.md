# Calculadoras Trabalhistas - InLab

Micro-SaaS de calculadoras trabalhistas brasileiras para embedar em posts de blog com A/B testing e dashboard de usuário.

## ✨ Funcionalidades

### 🧮 Calculadoras Implementadas
- **Calculadora de Férias**: Valor das férias + adicional de 1/3
- **Pró-Labore**: Definição do pró-labore baseado no faturamento
- **Custo do Funcionário**: Custo total incluindo encargos
- **13º Salário**: Cálculo proporcional do 13º salário

### 🎯 Sistema de Embeds
- **Modo A/B**: Uma calculadora por embed com weighted random selection
- **Modo Todas**: Todas as calculadoras com navegação por tabs
- **Responsivo**: Máximo 500x500px com container responsivo
- **Tracking**: Eventos automáticos de view, start, calculate, conversion

### 📊 Dashboard & Analytics
- **KPIs**: Views, cálculos, conversões, CR global
- **Gráfico temporal**: Eventos dos últimos 30 dias
- **Top calculadoras**: Performance individual
- **Relatório A/B**: Distribuição e performance das variantes
- **Histórico do usuário**: Cálculos salvos com possibilidade de reabertura

## 🚀 Tecnologias

### Frontend & Backend
- **Next.js 14+** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS**
- **shadcn/ui** (componentes acessíveis)

### Autenticação & Dados
- **Clerk** (email links, magic links)
- **Supabase** (PostgreSQL com schema dedicado `inlab_payroll_tools`)
- **Zod** (validação de dados)

### Qualidade & Testes
- **ESLint + Prettier**
- **Vitest** (testes unitários das fórmulas)
- **Playwright** (testes E2E dos embeds)

## 📋 Pré-requisitos

1. **Node.js 18+**
2. **Conta Supabase** (para banco de dados)
3. **Conta Clerk** (para autenticação)

## 🛠 Instalação

### 1. Clone e instale dependências
```bash
git clone <repo-url>
cd inlab-calculadora
npm install
```

### 2. Configure as variáveis de ambiente
Crie um arquivo `.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase Database  
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configure o banco de dados Supabase

Execute o script SQL que está em `supabase-schema.sql` no seu Supabase:

```sql
-- Cria o schema dedicado e todas as tabelas necessárias
-- Inclui calculadoras, variants A/B, events, calculations e leads
```

### 4. Inicie o desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 🎯 Como Usar os Embeds

### Embed A/B (uma calculadora aleatória)
```html
<script src="https://your-domain.com/embed.js" 
  data-mode="ab" 
  data-article="guia-ferias-2025" 
  data-width="500" 
  data-height="500" 
  async></script>
```

### Embed Todas (com abas)
```html
<script src="https://your-domain.com/embed.js" 
  data-mode="all" 
  data-article="calculadoras-trabalhistas" 
  data-width="500" 
  data-height="500" 
  async></script>
```

### Parâmetros do Embed
- `data-mode`: `"ab"` ou `"all"`
- `data-article`: Slug do artigo (para tracking)
- `data-width`: Largura máxima (cap: 500px)
- `data-height`: Altura máxima (cap: 500px)

## 📊 Schema do Banco de Dados

### Tabelas Principais
- `inlab_payroll_tools.calculators`: Calculadoras cadastradas
- `inlab_payroll_tools.ab_variants`: Variantes e pesos para A/B
- `inlab_payroll_tools.events`: Tracking de eventos
- `inlab_payroll_tools.calculations`: Cálculos salvos
- `inlab_payroll_tools.leads`: Emails coletados

### Eventos Trackados
- `view`: Carregamento do embed
- `start`: Primeiro input do usuário
- `calculate`: Cálculo realizado
- `save_email`: Email coletado
- `conversion`: Login concluído + cálculo salvo

## 🧪 Testes

### Testes Unitários (Vitest)
```bash
npm run test        # modo watch
npm run test:run    # execução única
npm run test:ui     # interface visual
```

### Testes E2E (Playwright)
```bash
npm run test:e2e    # execução headless
npm run test:e2e:ui # interface visual
```

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte o repositório no Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Variáveis de Ambiente para Produção
Certifique-se de configurar todas as variáveis do `.env.local` no painel da Vercel.

## 📐 Arquitetura

```
/src
  /app
    /(marketing)        # Página inicial
    /embed
      /ab              # Embed A/B
      /all             # Embed todas as calculadoras
    /dashboard         # Dashboard protegido
    /api               # API routes (track, ab-pick, save-calculation)
  
  /components
    /calculators       # Componentes das 4 calculadoras
    /embeds           # Wrapper components para embeds
    /dashboard        # Componentes do dashboard
    /ui               # shadcn/ui components
  
  /lib
    /supabase         # Clientes Supabase (browser/server)
    calculations.ts   # Fórmulas de cálculo
    schemas.ts        # Validações Zod
    tracking.ts       # Utilitários de tracking
    format.ts         # Formatação de valores
```

## 🔒 Segurança

- **RLS desabilitado** apenas para leitura pública conforme requisitos
- **Server Actions** para operações sensíveis
- **Service Role** apenas no servidor
- **Validação Zod** em todas as APIs
- **Middleware Clerk** para proteção de rotas

## 🎨 Customização

### Temas
O projeto usa Tailwind CSS com tema claro padrão. Para customizar cores:
1. Edite `src/app/globals.css`
2. Modifique as CSS variables do tema

### Calculadoras
Para adicionar uma nova calculadora:
1. Crie o componente em `src/components/calculators/`
2. Adicione as fórmulas em `src/lib/calculations.ts`
3. Atualize os schemas em `src/lib/schemas.ts`
4. Registre no banco em `calculators` e `ab_variants`

## 📈 Monitoramento

### Métricas Disponíveis
- Total de views por período
- Cálculos realizados
- Taxa de conversão
- Performance por calculadora
- Distribuição A/B

### Dashboard
Acesse `/dashboard` (autenticação necessária) para visualizar:
- KPIs gerais
- Gráfico de eventos
- Top calculadoras
- Relatório A/B
- Histórico pessoal

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Faça os commits com mensagens claras
4. Execute os testes
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

---

**Desenvolvido seguindo as melhores práticas de:**
- Código limpo e manutenível
- Arquitetura modular
- Testes automatizados
- Acessibilidade (a11y)
- Performance otimizada