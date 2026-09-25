import LegalPage from '../../components/legal-page';
import Link from 'next/link';

export const metadata = { title: 'Política de Privacidade | Meu Financeiro' };

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="DADOS E PRIVACIDADE" title="Política de Privacidade" updatedAt="25 de setembro de 2026">
      <p>Esta política explica como o Meu Financeiro trata os dados durante a fase de testes gratuita por convite.</p>
      <h2>Dados tratados</h2>
      <p>Para criar e usar uma conta, o app trata seu e-mail, nome e, se você escolher adicionar uma, sua foto de perfil. Ele também armazena os lançamentos que você inserir: descrição, valor, tipo, categoria e data.</p>
      <h2>Para que usamos os dados</h2>
      <p>Os dados são usados para autenticar sua conta, exibir seu perfil, salvar e mostrar seus próprios lançamentos e manter o funcionamento e a segurança do serviço. O app não conecta às suas contas bancárias.</p>
      <h2>Onde ficam armazenados</h2>
      <p>O aplicativo é hospedado na Vercel. A autenticação, os lançamentos e as fotos ficam nos serviços do Supabase. As fotos de perfil ficam em armazenamento privado e são exibidas somente para a conta correspondente. Cada conta deve acessar apenas os próprios lançamentos.</p>
      <h2>Compartilhamento</h2>
      <p>O app não vende seus dados nem os usa para publicidade. A Vercel e o Supabase fornecem a infraestrutura técnica necessária para hospedar o aplicativo e armazenar os dados.</p>
      <h2>Seus controles</h2>
      <p>Você pode editar ou excluir seus lançamentos, alterar seu nome e adicionar ou remover sua foto. Para solicitar a exclusão da conta e dos dados associados, fale com a pessoa que compartilhou o convite com você. Você também pode exportar seus lançamentos usando a função de backup do app.</p>
      <h2>Contato</h2>
      <p>Para dúvidas ou solicitações sobre seus dados, entre em contato com a pessoa que enviou seu convite para usar o Meu Financeiro.</p>
    </LegalPage>
  );
}
