# Meu Financeiro V2 — Fundação

Esta branch é isolada da main e não altera produção.

## Entrega 1
- Utilitário financeiro com cálculos em centavos inteiros.
- Validação explícita de valores positivos e de até duas casas decimais.
- Testes unitários com o runner nativo do Node.

## Regras de domínio propostas
- Saldo do período não é saldo disponível em conta.
- Descontos em folha não devem ser registrados duas vezes.
- Compra no cartão e pagamento de fatura não são duas despesas independentes.
- Transferências entre contas próprias não são receitas nem despesas.
- Lançamentos devem pertencer ao usuário autenticado; manter RLS no Supabase.

## Próximos passos (não implementados)
1. Integrar funções financeiras ao dashboard após testes.
2. Definir contas e saldos iniciais, com migrações compatíveis.
3. Criar orçamento por categoria e despesas recorrentes.
4. Modelar dívidas, parcelas, cartões e faturas.
5. Verificar isolamento entre usuários, importação de backups e responsividade.

## Execução dos testes
`node --test src/lib/finance/*.test.js`

Não executar migrações nem deploy sem revisão e autorização.
