import './globals.css';

export const metadata = {
  title: 'Meu Financeiro',
  description: 'Seu controle financeiro pessoal, com dados sincronizados na sua conta.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
