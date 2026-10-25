import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const page = await readFile(new URL('../app/dashboard/faturacao/page.tsx', import.meta.url), 'utf8')
const actions = await readFile(new URL('../app/dashboard/faturacao/actions.ts', import.meta.url), 'utf8')

test('billing server reports transaction and reservation truncation explicitly', () => {
  assert.match(actions, /transactionsTruncated:\s*\(transactionsResult\.data\?\.length \?\? 0\) === 500/)
  assert.match(actions, /reservationsTruncated:\s*reservations\.length === 100/)
  assert.match(actions, /\.limit\(500\)/)
  assert.match(actions, /\.limit\(100\)/)
})

test('billing UI does not present truncated samples as all-time totals', () => {
  assert.match(page, /setTransactionsTruncated\(Boolean\(data\.transactionsTruncated\)\)/)
  assert.match(page, /setReservationsTruncated\(Boolean\(data\.reservationsTruncated\)\)/)
  assert.match(page, /const partialFinancialData=transactionsTruncated\|\|reservationsTruncated/)
  assert.match(page, /Totais parciais/)
  assert.match(page, /não devem ser interpretados como saldo histórico integral/)
  assert.match(page, /Saldo dos movimentos carregados/)
  assert.match(page, /Cash in · carregado/)
  assert.match(page, /Cash out · carregado/)
})
