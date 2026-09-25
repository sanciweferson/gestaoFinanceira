import LegalPage from '../../components/legal-page';
import Link from 'next/link';

export const metadata = { title: 'Termos de Uso | Meu Financeiro' };

export default function TermsPage() {
  return (
    <LegalPage eyebrow="INFORMAÇÕES DO SERVIÇO" title="Termos de Uso" updatedAt="25 de setembro de 2026">
      <p>O Meu Financeiro é um aplicativo em fase de testes, compartilhado gratuitamente por convite para ajudar cada pessoa a organizar receitas e despesas.</p>
      <h2>Uso da conta</h2>
      <p>Use sua própria conta, mantenha sua senha em segurança e informe dados corretos. Os lançamentos de cada conta são separados. Não compartilhe seu acesso com outras pessoas.</p>
      <h2>Finalidade e limites</h2>
      <p>O aplicativo serve para organização pessoal. Ele não é um banco, não movimenta dinheiro e não oferece aconselhamento financeiro, contábil ou de investimento. Confira seus registros e mantenha cópias de segurança quando necessário.</p>
      <h2>Fase de testes</h2>
      <p>Como o serviço está em testes, recursos podem mudar e podem ocorrer interrupções. O uso é gratuito durante esta fase. Não há cobrança nem assinatura ativa no aplicativo.</p>
      <h2>Encerramento e dúvidas</h2>
      <p>Você pode parar de usar o serviço quando quiser. Para pedir ajuda ou solicitar o encerramento da conta e a exclusão dos dados, fale com a pessoa que compartilhou o convite do aplicativo com você.</p>
      <h2>Privacidade</h2>
      <p>O tratamento das informações está explicado na <Link href="/privacy">Política de Privacidade</Link>, que faz parte destas condições de uso.</p>
    </LegalPage>
  );
}
