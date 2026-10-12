// src/simulation/paymentSimulator.ts
import { PaymentFailureScenario } from '../types/network';
import { generateId, sleep } from '../utils/helpers';

export interface PaymentTransactionResult {
  transactionId: string;
  idempotencyKey: string;
  orderId: string;
  status: 'Successful' | 'Failed' | 'Delayed Confirmation' | 'Timeout Pending';
  amount: number;
  method: string;
  timestamp: string;
  reconciled: boolean;
  message: string;
}

export async function processSimulatedPayment(
  orderId: string,
  idempotencyKey: string,
  amount: number,
  method: string,
  scenario: PaymentFailureScenario,
  effectiveLatencyMs = 200
): Promise<PaymentTransactionResult> {
  const txnId = generateId('TXN');
  const now = new Date().toISOString();

  // Simulated gateway processing delay
  await sleep(Math.min(effectiveLatencyMs, 400));

  if (scenario === 'Failed Request') {
    return {
      transactionId: txnId,
      idempotencyKey,
      orderId,
      status: 'Failed',
      amount,
      method,
      timestamp: now,
      reconciled: false,
      message: 'HTTP 402 / 504 Gateway Reject: Card/UPI bank switch rejected payment or network timed out.',
    };
  }

  if (scenario === 'Delayed Confirmation') {
    return {
      transactionId: txnId,
      idempotencyKey,
      orderId,
      status: 'Delayed Confirmation',
      amount,
      method,
      timestamp: now,
      reconciled: false,
      message: 'Gateway received funds, but webhook confirmation delayed by network congestion. Awaiting reconciliation.',
    };
  }

  if (scenario === 'Success Timeout') {
    return {
      transactionId: txnId,
      idempotencyKey,
      orderId,
      status: 'Timeout Pending',
      amount,
      method,
      timestamp: now,
      reconciled: false,
      message: 'Payment charged at bank, but HTTP ACK lost due to packet drop. Idempotency key stored for automatic reconciliation.',
    };
  }

  // Normal
  return {
    transactionId: txnId,
    idempotencyKey,
    orderId,
    status: 'Successful',
    amount,
    method,
    timestamp: now,
    reconciled: true,
    message: 'Payment verified and confirmed via secure TLS 1.3 gateway webhook.',
  };
}
