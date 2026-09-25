import Link from 'next/link';

export default function LegalPage({ eyebrow, title, updatedAt, children }) {
  return (
    <main className="legal-page">
      <article className="legal-card">
        <Link className="brand legal-brand" href="/login">
          <span className="brand-mark">M</span>
          <span>meu<span className="brand-light">financeiro</span></span>
        </Link>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="legal-updated">Atualizado em {updatedAt}</p>
        <div className="legal-content">{children}</div>
        <Link className="button button-secondary legal-back" href="/login">Voltar ao app</Link>
      </article>
    </main>
  );
}
