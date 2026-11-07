import test from "node:test"
import assert from "node:assert/strict"
import { parseMoneyToCents, centsToAmount, summarizeTransactions } from "./money.js"

test("interpreta valores em reais e centavos", () => {
  assert.equal(parseMoneyToCents("12,34"), 1234)
  assert.equal(parseMoneyToCents("12.34"), 1234)
  assert.equal(parseMoneyToCents("12"), 1200)
})
test("rejeita valores inválidos", () => {
  for (const value of ["", "0", "-1", "NaN", "Infinity", "1.234,56", "1.999", "abc"]) {
    assert.throws(() => parseMoneyToCents(value))
  }
})
test("soma valores sem erro de ponto flutuante", () => {
  assert.deepEqual(summarizeTransactions([
    { type: "income", amount: "0.30" },
    { type: "expense", amount: "0.10" },
    { type: "expense", amount: "0.20" },
  ]), { income: 0.3, expense: 0.3, balance: 0 })
  assert.equal(centsToAmount(55000), 550)
})
