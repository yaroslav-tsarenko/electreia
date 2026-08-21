import crypto from "crypto";

export interface TransfermitPaymentData {
  paymentType: "DEPOSIT";
  paymentMethod: "BASIC_CARD" | "APPLEPAYTOKEN";
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

function getApiUrl(methodType: string): string {
  const envUrl = process.env.TRANSFERMIT_API_URL;
  if (envUrl) {
    return `${envUrl.replace(/\/$/, "")}/api/v1/payments`;
  }
  
  if (methodType === "applepay_visa" || methodType === "applepay_mastercard") {
    const isTest = process.env.NODE_ENV === "development" || process.env.TRANSFERMIT_TEST_MODE === "true";
    const baseUrl = isTest ? "https://app-demo.transfermit.com" : "https://app.transfermit.com";
    return `${baseUrl}/api/v1/payments`;
  }
  
  return "https://app.transfermit.com/api/v1/payments";
}

/**
 * Creates a payment with Transfermit
 */
export async function createTransfermitPayment(
  data: Omit<TransfermitPaymentData, "paymentMethod"> & { paymentMethod: "BASIC_CARD" | "APPLEPAYTOKEN" },
  methodType: string
) {
  let rawApiKey = process.env.TRANSFERMIT_API_KEY;

  if (methodType === "applepay_visa") {
    rawApiKey = process.env.TRANSFERMIT_VISA_API_KEY || "FG2WMPPaPAfas1WrhqsAxTglF6zpy99M";
  } else if (methodType === "applepay_mastercard") {
    rawApiKey = process.env.TRANSFERMIT_MASTERCARD_API_KEY || "K8GG5AXNzuEtNJAhWdMNFFKQHaDevdQJ";
  }

  if (!rawApiKey) {
    throw new Error(`TRANSFERMIT_API_KEY is not configured in .env for ${methodType}`);
  }
  const apiKey = rawApiKey.replace(/^["']|["']$/g, "");
  const apiUrl = getApiUrl(methodType);

  const response = await fetch(apiUrl, {
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
export async function createTransfermitRefund(data: TransfermitRefundData, methodType: string) {
  let rawApiKey = process.env.TRANSFERMIT_API_KEY;

  if (methodType === "applepay_visa") {
    rawApiKey = process.env.TRANSFERMIT_VISA_API_KEY || "FG2WMPPaPAfas1WrhqsAxTglF6zpy99M";
  } else if (methodType === "applepay_mastercard") {
    rawApiKey = process.env.TRANSFERMIT_MASTERCARD_API_KEY || "K8GG5AXNzuEtNJAhWdMNFFKQHaDevdQJ";
  }

  if (!rawApiKey) {
    throw new Error(`TRANSFERMIT_API_KEY is not configured in .env for ${methodType}`);
  }
  const apiKey = rawApiKey.replace(/^["']|["']$/g, "");
  const apiUrl = getApiUrl(methodType);

  const response = await fetch(apiUrl, {
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
export function verifyTransfermitSignature(rawBody: string, signature: string, secretKey: string): boolean {
  if (!signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(rawBody)
    .digest("hex");

  const sigBuffer = Buffer.from(signature.toLowerCase(), "hex");
  const expectedBuffer = Buffer.from(expectedSignature.toLowerCase(), "hex");

  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}
