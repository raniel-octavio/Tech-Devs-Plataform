<div align="center">
`< TECH DEVS />` Board
Gestão de atividades da equipe, no estilo Jira — 100% front-end, sem backend para hospedar.
Coding • Tech • Growth
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)
</div>
---
Sobre
O Tech Devs Board é uma plataforma de gerenciamento de tarefas para times de desenvolvimento, com quadro Kanban, sprints, dashboard e comentários. Ele roda inteiramente no navegador (Next.js) e conversa direto com o Supabase (Postgres + Auth + Realtime).
Isso significa que não existe servidor próprio para manter: você publica o front-end na Vercel, guarda os dados no Supabase e pronto.
O visual segue a identidade da equipe: espaço escuro, azul elétrico, laranja de foguete e os colchetes `</>`.
<!--
  Dica: adicione prints do projeto em docs/ e descomente as linhas abaixo.

  ![Login](docs/login.png)
  ![Quadro](docs/board.png)
  ![Dashboard](docs/dashboard.png)
Funcionalidades
Quadro Kanban com cinco colunas (Backlog, A fazer, Em andamento, Em revisão, Concluído), arrastar e soltar, reordenação dentro da coluna e criação rápida de tarefas.
Visão em lista com tabela de todas as tarefas e troca de status direto na linha.
Dashboard com tarefas por status e prioridade, carga por pessoa, atrasadas e progresso da sprint ativa.
Tarefas completas: título, descrição, tipo (tarefa, bug, história, épico), prioridade, responsável, sprint, pontos, prazo, etiquetas e comentários.
Chave por projeto: as tarefas recebem numeração automática, como `TDV-1`, `TDV-2`…
Sprints: criar, iniciar e concluir. Ao concluir, o que não foi finalizado volta para "sem sprint".
Filtros por busca, responsável, sprint, prioridade e tipo.
Vários projetos na mesma conta da equipe.
Tempo real: quando alguém move ou edita uma tarefa, todos veem a mudança na hora.
Login por e-mail e senha (Supabase Auth), com segurança por RLS no banco.
Responsivo, com menu lateral recolhível no celular.
Stack
Camada	Tecnologia
Framework	Next.js 15 (App Router) + React 19
Linguagem	TypeScript
Estilo	Tailwind CSS 3 + Lucide Icons
Dados e login	Supabase (Postgres, Auth, Realtime) via `@supabase/supabase-js`
Hospedagem	Vercel
Como funciona (sem backend)
```
Navegador (Next.js)  ──►  Supabase (Postgres + Auth + Realtime)
        ▲
     Vercel (arquivos estáticos do front-end)
```
O front-end usa só a chave pública (`anon`/`publishable`) do Supabase. Quem protege os dados é o RLS (Row Level Security) do banco, já configurado em `supabase/schema.sql`: somente usuários autenticados leem e escrevem.
Começando
Pré-requisitos
Node.js 18.18 ou superior
Uma conta gratuita no Supabase
1. Clonar e instalar
```bash
git clone https://github.com/SEU-USUARIO/techdevs-board.git
cd techdevs-board
npm install
```
2. Criar o banco no Supabase
Crie um projeto no Supabase.
Abra o SQL Editor, cole todo o conteúdo de `supabase/schema.sql` e clique em Run.
Isso cria as tabelas, os gatilhos, as políticas de segurança e liga o tempo real.
Em Project Settings → API Keys, copie a Project URL e a chave anon (ou publishable).
> O script pode ser executado mais de uma vez com segurança.
3. Configurar as variáveis de ambiente
Crie o arquivo `.env.local` na raiz (copie o `.env.example`):
```bash
cp .env.example .env.local
```
```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA-CHAVE-ANON-OU-PUBLISHABLE
NEXT_PUBLIC_ALLOW_SIGNUP=true
```
Variável	Descrição
`NEXT_PUBLIC_SUPABASE_URL`	URL do projeto no Supabase
`NEXT_PUBLIC_SUPABASE_ANON_KEY`	Chave pública (`anon` ou `publishable`)
`NEXT_PUBLIC_ALLOW_SIGNUP`	`false` esconde o botão "Criar conta" (opcional, padrão `true`)
> Nunca use a chave `service_role` / `secret` neste projeto. Ela ignora o RLS e ficaria exposta no navegador.
4. Rodar
```bash
npm run dev
```
Abra http://localhost:3000, entre com a sua conta e crie o primeiro projeto.
Gerenciando a equipe
Por padrão qualquer pessoa pode criar conta. Para uso interno, o recomendado é fechar o cadastro e criar cada membro pelo painel:
No Supabase, em Authentication → Sign In / Providers, desligue Allow new users to sign up.
Crie os membros em Authentication → Users → Add user → Create new user, marcando Auto Confirm User.
Defina `NEXT_PUBLIC_ALLOW_SIGNUP=false` para esconder o botão "Criar conta" no app.
O perfil de cada pessoa é criado automaticamente. Para ajustar o nome exibido, edite `full_name` em Table Editor → profiles.
> Se mantiver o cadastro aberto com confirmação de e-mail, configure um SMTP próprio (Resend, Brevo, etc.). O envio padrão do Supabase tem limite de poucos e-mails por hora.
Deploy na Vercel
Envie o projeto para um repositório no GitHub.
Na Vercel, clique em Add New → Project e importe o repositório.
Em Environment Variables, cadastre as mesmas variáveis do `.env.local`.
Clique em Deploy.
Nenhum servidor adicional é necessário.
Modelo de dados
Tabela	Descrição
`profiles`	Membros da equipe (criados automaticamente a partir do login)
`projects`	Projetos, com chave única (ex.: `TDV`) e contador de tarefas
`sprints`	Sprints do projeto (`planned`, `active`, `closed`)
`tasks`	Tarefas, com status, prioridade, tipo, responsável, sprint, pontos, prazo, etiquetas e posição no quadro
`comments`	Comentários nas tarefas
Estrutura do projeto
```
├── src/
│   ├── app/                # página única e layout (fontes e tema)
│   ├── components/         # Board, TaskCard, ListView, Dashboard, modais, Sidebar…
│   ├── hooks/
│   │   └── useWorkspace.ts # dados, ações e tempo real com o Supabase
│   └── lib/                # cliente Supabase, tipos e constantes
├── supabase/
│   └── schema.sql          # tabelas, RLS, gatilhos e realtime
├── tailwind.config.ts      # paleta do tema (neon, fire, ink)
└── .env.example
```
Personalização
Cores do tema: `tailwind.config.ts` (`neon` = azul, `fire` = laranja, `ink` = fundo).
Colunas, prioridades e tipos: `src/lib/constants.ts`. Se mudar os status, ajuste também o `check` da tabela `tasks` em `supabase/schema.sql`.
Scripts
Comando	O que faz
`npm run dev`	Servidor de desenvolvimento
`npm run build`	Build de produção
`npm run start`	Roda o build de produção
`npm run typecheck`	Checagem de tipos com TypeScript
Segurança
A chave pública do Supabase fica visível no navegador por design. A proteção real é o RLS.
Todos os usuários logados têm o mesmo nível de acesso e podem editar qualquer tarefa. Para ter papéis (admin e membro), é possível evoluir as políticas em `supabase/schema.sql`.
Prefira cadastro fechado e usuários criados pelo painel (veja Gerenciando a equipe).
Ideias para o futuro
Papéis e permissões (admin, membro, visualizador)
Anexos e menções em comentários
Página de perfil para o próprio usuário editar nome e avatar
Histórico de atividades da tarefa
Gráfico de burndown da sprint
Licença
Defina a licença do projeto (por exemplo, MIT) adicionando um arquivo `LICENSE`.
---
<div align="center">
Feito pela equipe Tech Devs 🚀
</div>
