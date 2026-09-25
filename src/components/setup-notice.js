import Link from 'next/link';

export default function SetupNotice() {
  return (
    <main className="setup-page">
      <section className="setup-card">
        <Link className="brand setup-brand" href="/">
          <span className="brand-mark">M</span>
          <span>meu<span className="brand-light">financeiro</span></span>
        </Link>
        <p className="eyebrow">CONFIGURAÇÃO INICIAL</p>
        <h1>Conecte seu projeto Supabase</h1>
        <p>O app já está preparado e a tabela de lançamentos já foi criada no projeto Supabase conectado. Configure as variáveis locais para ligar esta cópia do app ao banco.</p>
        <ol>
          <li>Copie <code>.env.example</code> para <code>.env.local</code>.</li>
          <li>Preencha a URL do projeto e a chave publicável.</li>
          <li>Reinicie o servidor com <code>npm run dev</code>.</li>
        </ol>
        <p className="setup-footnote">O SQL usado está em <code>supabase/migrations</code> para documentar ou reproduzir o esquema em outro projeto.</p>
        <p className="setup-footnote">Use a chave publicável do projeto. Nunca coloque uma chave <code>service_role</code> em variável <code>NEXT_PUBLIC_*</code>.</p>
      </section>
    </main>
  );
}
