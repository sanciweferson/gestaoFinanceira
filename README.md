# Meu Financeiro — Next.js + Supabase

Versão com Next.js App Router, JavaScript, login por e-mail e senha e dados compartilhados pelo Supabase. A tabela usa Row Level Security (RLS): cada conta só pode consultar, adicionar, editar e excluir os próprios lançamentos.

## 1. Projeto Supabase

O projeto `controle de financas` já está conectado e a tabela `public.transactions`, com RLS e políticas por usuário, já foi criada. O SQL está no repositório para documentar o esquema ou reproduzi-lo em outro projeto.

Em **Project Settings → API**, copie a Project URL e a chave publicável (`sb_publishable_...`). Em **Authentication → URL Configuration**, configure a URL local `http://localhost:3000` e inclua `http://localhost:3000/auth/callback` nas URLs de redirecionamento.

## 2. Configurar e rodar localmente

No WSL, dentro desta pasta:

```bash
cp .env.example .env.local
```

Edite `.env.local` e substitua os exemplos:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_sua_chave
```

Depois rode:

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. Crie sua conta na tela de login. Se a confirmação de e-mail estiver habilitada no Supabase, confirme a mensagem recebida antes de entrar.

## 3. Publicar na Vercel

1. Envie o projeto ao GitHub sem incluir `.env.local`.
2. Importe o repositório na Vercel.
3. Cadastre `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` nas variáveis de ambiente da Vercel.
4. Em Supabase → Authentication → URL Configuration, defina a URL publicada como Site URL e acrescente `https://SEU-DOMINIO/auth/callback` às Redirect URLs.
5. Faça o deploy novamente depois de salvar as variáveis.

## Segurança das chaves

O frontend usa somente a chave publicável, protegida pelas políticas RLS da tabela. Nunca coloque `service_role` ou outra chave secreta em arquivo `NEXT_PUBLIC_*`, no GitHub ou no navegador. `.env.local` está excluído pelo `.gitignore`.

## Migração dos lançamentos da versão anterior

Na versão Vite, use **Exportar backup** para gerar o JSON. Depois entre na nova versão com sua conta Supabase e use **Importar backup**. Os lançamentos serão adicionados à tabela da conta atual; a política RLS continua limitando cada usuário aos próprios dados.

## Estrutura

```text
meu-controle-financeiro-next/
├── proxy.js
├── src/
│   ├── app/
│   │   ├── auth/callback/route.js
│   │   ├── login/page.js
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js
│   ├── components/
│   └── lib/supabase/
└── supabase/migrations/
```
