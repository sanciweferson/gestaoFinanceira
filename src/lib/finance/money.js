// Monetary values are stored and calculated as integer cents to avoid float drift.
export function parseMoneyToCents(input) {
  const raw = String(input ?? "").trim()
  if (!/^(?:\d+)(?:[.,]\d{1,2})?$/.test(raw)) {
    throw new Error("Informe um valor monetário válido, com até duas casas decimais.")
  }
  const [whole, fraction = ""] = raw.replace(",", ".").split(".")
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"))
  if (!Number.isSafeInteger(cents) || cents <= 0 || cents > 999999999999) {
    throw new Error("O valor precisa ser positivo e estar dentro do limite permitido.")
  }
  return cents
}

export function centsToAmount(cents) {
  if (!Number.isSafeInteger(cents)) throw new Error("Valor inválido em centavos.")
  return cents / 100
}

export function summarizeTransactions(transactions) {
  let incomeCents = 0
  let expenseCents = 0
  for (const entry of transactions) {
    const cents = parseMoneyToCents(entry.amount)
    if (entry.type === "income") incomeCents += cents
    else if (entry.type === "expense") expenseCents += cents
    else throw new Error("Tipo de lançamento inválido.")
  }
  return {
    income: centsToAmount(incomeCents),
    expense: centsToAmount(expenseCents),
    balance: centsToAmount(incomeCents - expenseCents),
  }
}
