import test from 'node:test'
import assert from 'node:assert/strict'
import { executeSettlement } from '../lib/billing/settlement-engine.ts'

function harness() {
  let status='eligible', transferCalls=0, persisted=null, finalized=0
  const seen=new Map()
  const deps={
    acquireLock:async()=>{if(status!=='eligible')return false;status='processing';return true},
    releaseLock:async()=>{if(status==='processing')status='eligible'},
    createTransfer:async({idempotencyKey})=>{transferCalls++;if(seen.has(idempotencyKey))return seen.get(idempotencyKey);const t={id:'tr_test_1'};seen.set(idempotencyKey,t);return t},
    persistTransfer:async(_id,transferId)=>{persisted=transferId},
    finalizeSettlement:async()=>{if(status!=='processing')return false;status='transferred';finalized++;return true},
  }
  return {deps,get:()=>({status,transferCalls,persisted,finalized}),setStatus:s=>{status=s}}
}

const input={reservationId:'r1',transactionId:'tx1',amount:1000,currency:'eur',destination:'acct_test',sourceType:'service_reservation'}

test('two concurrent workers result in exactly one Stripe transfer', async()=>{
  const h=harness()
  const [a,b]=await Promise.all([executeSettlement(input,h.deps),executeSettlement(input,h.deps)])
  assert.equal(h.get().transferCalls,1)
  assert.equal(h.get().status,'transferred')
  assert.equal([a,b].filter(x=>x.transferred).length,1)
})

test('dispute that blocks before lock causes zero transfers',async()=>{
  const h=harness();h.setStatus('blocked')
  const result=await executeSettlement(input,h.deps)
  assert.equal(result.reason,'lock_not_acquired')
  assert.equal(h.get().transferCalls,0)
})

test('Stripe failure releases processing lock for safe retry',async()=>{
  const h=harness();h.deps.createTransfer=async()=>{throw new Error('stripe unavailable')}
  await assert.rejects(()=>executeSettlement(input,h.deps),/stripe unavailable/)
  assert.equal(h.get().status,'eligible')
})

test('local persistence failure after Stripe success keeps processing lock',async()=>{
  const h=harness();h.deps.persistTransfer=async()=>{throw new Error('database unavailable')}
  await assert.rejects(()=>executeSettlement(input,h.deps),/database unavailable/)
  assert.equal(h.get().status,'processing')
  assert.equal(h.get().transferCalls,1)
})

test('deterministic idempotency key is reservation scoped',async()=>{
  const h=harness();const result=await executeSettlement(input,h.deps)
  assert.equal(result.idempotencyKey,'reservation-settlement:r1')
  assert.equal(result.transferGroup,'f4s:service_reservation:r1')
})
