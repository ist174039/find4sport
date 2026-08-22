import test from 'node:test'
import assert from 'node:assert/strict'
import { executeReservationRefund } from '../lib/billing/admin-refund.ts'

const base={reservationId:'r1',chargeId:'ch_1',paymentIntentId:'pi_1',reason:'admin_dispute_refund'}
function harness(transfer={id:'tr_1',amount:1000,amount_reversed:0}){const calls={retrieve:0,reversal:[],refund:[]};return{calls,deps:{retrieveTransfer:async()=>{calls.retrieve++;return transfer},createReversal:async(id,amount,metadata,key)=>{calls.reversal.push({id,amount,metadata,key});return{id:'trr_1',amount}},createRefund:async(payment,metadata,key)=>{calls.refund.push({payment,metadata,key});return{id:'re_1',status:'succeeded'}}}}}

test('refund without transfer does not reverse funds',async()=>{const h=harness();const r=await executeReservationRefund(base,h.deps);assert.equal(h.calls.retrieve,0);assert.equal(h.calls.reversal.length,0);assert.equal(h.calls.refund.length,1);assert.equal(r.succeeded,true)})
test('settled reservation reverses full remaining transfer before refund',async()=>{const h=harness();const r=await executeReservationRefund({...base,transferId:'tr_1'},h.deps);assert.equal(h.calls.reversal[0].amount,1000);assert.equal(h.calls.refund[0].metadata.reversal_id,'trr_1');assert.equal(r.reversal.id,'trr_1')})
test('partially reversed transfer only reverses remaining amount',async()=>{const h=harness({id:'tr_1',amount:1000,amount_reversed:400});await executeReservationRefund({...base,transferId:'tr_1'},h.deps);assert.equal(h.calls.reversal[0].amount,600)})
test('fully reversed transfer skips another reversal',async()=>{const h=harness({id:'tr_1',amount:1000,amount_reversed:1000});await executeReservationRefund({...base,transferId:'tr_1'},h.deps);assert.equal(h.calls.reversal.length,0);assert.equal(h.calls.refund.length,1)})
test('idempotency keys are deterministic',async()=>{const h=harness();await executeReservationRefund({...base,transferId:'tr_1'},h.deps);assert.equal(h.calls.reversal[0].key,'reservation-transfer-reversal:r1:admin_dispute_refund');assert.equal(h.calls.refund[0].key,'reservation-refund:r1:admin_dispute_refund')})
test('refund failure propagates after reversal for safe retry',async()=>{const h=harness();h.deps.createRefund=async()=>{throw new Error('stripe refund unavailable')};await assert.rejects(()=>executeReservationRefund({...base,transferId:'tr_1'},h.deps),/stripe refund unavailable/);assert.equal(h.calls.reversal.length,1)})
test('invalid Stripe identifiers are rejected before side effects',async()=>{const h=harness();await assert.rejects(()=>executeReservationRefund({...base,chargeId:'bad',paymentIntentId:null},h.deps),/Pagamento Stripe/);assert.equal(h.calls.retrieve,0);assert.equal(h.calls.refund.length,0)})
