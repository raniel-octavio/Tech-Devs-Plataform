# Tech Devs Board 🚀

Plataforma estilo Jira para gerenciar as atividades da equipe. **100% front-end** (Next.js) falando direto com o **Supabase** — sem backend para hospedar. Basta publicar na Vercel.

**Recursos:** quadro Kanban com arrastar e soltar · lista de tarefas · dashboard · projetos com chave (TDV-1, TDV-2…) · sprints · responsáveis, prioridade, tipo (tarefa/bug/história/épico), pontos, prazo, etiquetas · comentários · login por e-mail/senha · atualização em tempo real entre a equipe.

## 1. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Abra **SQL Editor**, cole todo o conteúdo de `supabase/schema.sql` e clique em **Run**.
   Isso cria as tabelas, as regras de segurança (RLS) e liga o tempo real.
3. Em **Project Settings → API**, copie a **Project URL** e a **anon public key**.

## 2. Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha URL e anon key
npm run dev
```

Abra http://localhost:3000, crie sua conta e depois o primeiro projeto.

## 3. Publicar na Vercel

1. Suba o projeto para um repositório (GitHub, GitLab…) e importe na Vercel.
2. Em **Settings → Environment Variables**, cadastre:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ALLOW_SIGNUP` (opcional, `true` ou `false`)
3. Faça o deploy. Nenhum servidor próprio é necessário.

## Segurança (leia!)

- A anon key fica visível no navegador — isso é normal no Supabase. **Quem protege os dados é o RLS**, já configurado no `schema.sql`: só usuários logados leem e escrevem.
- Por padrão, **qualquer pessoa pode criar conta** e acessar o quadro. Depois que sua equipe se cadastrar, escolha uma opção:
  - No Supabase: **Authentication → Providers → Email → desative "Allow new users to sign up"** e convide pessoas por **Authentication → Users → Invite user**; e/ou
  - Defina `NEXT_PUBLIC_ALLOW_SIGNUP=false` para esconder o botão "Criar conta".
- Se quiser exigir confirmação de e-mail, ative em **Authentication → Providers → Email → Confirm email**.
- Todos os membros logados têm o mesmo nível de acesso (podem editar qualquer tarefa). Se precisar de papéis (admin/membro), dá para evoluir as políticas RLS.

## Estrutura

```
src/app/            página única + layout (fontes e tema)
src/components/     Board, TaskCard, ListView, Dashboard, modais, Sidebar…
src/hooks/          useWorkspace (dados, ações e tempo real com Supabase)
src/lib/            cliente Supabase, tipos e constantes
supabase/schema.sql tabelas, RLS e realtime
```

## Personalização rápida

- Cores do tema: `tailwind.config.ts` (`neon` = azul, `fire` = laranja, `ink` = fundo).
- Colunas do quadro, prioridades e tipos: `src/lib/constants.ts` (se mudar os status, ajuste também o `check` em `supabase/schema.sql`).
