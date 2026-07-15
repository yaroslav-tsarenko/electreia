import crypto from "crypto";

export interface TransfermitPaymentData {
  paymentType: "DEPOSIT";
  paymentMethod: "BASIC_CARD";
  amount: number;
  currency: string;
  description: string;
  referenceId: string;
  customer: {
    referenceId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    ip: string;
  };
  billingAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    countryCode: string;
    postalCode: string;
    state?: string;
  };
  returnUrl: string;
  webhookUrl: string;
}

export interface TransfermitRefundData {
  paymentType: "REFUND";
  parentPaymentId: string;
  amount: number;
  currency: string;
}

const API_URL = "https://app.transfermit.com/api/v1/payments";

/**
 * Creates a payment with Transfermit
 */
export async function createTransfermitPayment(data: TransfermitPaymentData) {
  const rawApiKey = process.env.TRANSFERMIT_API_KEY;
  if (!rawApiKey) {
    throw new Error("TRANSFERMIT_API_KEY is not configured in .env");
  }
  const apiKey = rawApiKey.replace(/^["']|["']$/g, "");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
      "User-Agent": "Transfermit-NextJS/1.0",
    },
    body: JSON.stringify(data),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Transfermit API error (${response.status}): ${responseText}`);
  }

  return JSON.parse(responseText);
}

/**
 * Creates a refund with Transfermit
 */
export async function createTransfermitRefund(data: TransfermitRefundData) {
  const rawApiKey = process.env.TRANSFERMIT_API_KEY;
  if (!rawApiKey) {
    throw new Error("TRANSFERMIT_API_KEY is not configured in .env");
  }
  const apiKey = rawApiKey.replace(/^["']|["']$/g, "");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
      "User-Agent": "Transfermit-NextJS/1.0",
    },
    body: JSON.stringify(data),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Transfermit Refund API error (${response.status}): ${responseText}`);
  }

  return JSON.parse(responseText);
}

/**
 * Verifies webhook signature sent by Transfermit
 */
export function verifyTransfermitSignature(rawBody: string, signature: string): boolean {
  const rawWebhookSecret = process.env.TRANSFERMIT_WEBHOOK_SECRET;
  if (!rawWebhookSecret) {
    throw new Error("TRANSFERMIT_WEBHOOK_SECRET is not configured in .env");
  }
  const webhookSecret = rawWebhookSecret.replace(/^["']|["']$/g, "");

  if (!signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  const sigBuffer = Buffer.from(signature.toLowerCase(), "hex");
  const expectedBuffer = Buffer.from(expectedSignature.toLowerCase(), "hex");

  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}
