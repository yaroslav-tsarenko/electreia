import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTransfermitSignature } from "@/lib/transfermit";
import { sendOrderConfirmationEmail, sendOrderInvoiceEmail } from "@/lib/email";
import { scheduleEmail } from "@/lib/email-jobs";
import { sendOrderToHub } from "@/lib/hub";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("signature") || request.headers.get("x-signature") || "";

    const rawWebhookSecret = process.env.TRANSFERMIT_WEBHOOK_SECRET;
    const webhookSecret = rawWebhookSecret ? rawWebhookSecret.replace(/^["']|["']$/g, "") : undefined;

    // Verify signature if webhook secret is configured and is not the default test key
    if (webhookSecret && webhookSecret !== "test_webhook_secret") {
      const isValid = verifyTransfermitSignature(rawBody, signature);
      if (!isValid) {
        console.error("[TRANSFERMIT WEBHOOK] Invalid signature received");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const { id: paymentId, paymentType, state, referenceId } = payload;

    console.log(
      `[TRANSFERMIT WEBHOOK] Processing webhook: paymentId=${paymentId}, state=${state}, referenceId=${referenceId}, type=${paymentType}`
    );

    // Try to find the order by ID
    let order = await prisma.order.findUnique({
      where: { id: referenceId },
      include: { items: true },
    });

    // Fallback: search by paymentId in database
    if (!order && paymentId) {
      order = await prisma.order.findFirst({
        where: { paymentId },
        include: { items: true },
      });
    }

    if (!order) {
      console.warn(`[TRANSFERMIT WEBHOOK] Order not found for referenceId=${referenceId} or paymentId=${paymentId}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Handle Refund Webhook
    if (paymentType === "REFUND") {
      if (state === "COMPLETED") {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "REFUNDED",
            status: "REFUNDED",
          },
        });
        console.log(`[TRANSFERMIT WEBHOOK] Order ${order.id} marked as REFUNDED`);
      }
      return NextResponse.json({ status: "ok" });
    }

    // Handle Deposit (Payment) Webhook
    switch (state) {
      case "COMPLETED":
        // Only update and send emails if not already paid
        if (order.paymentStatus !== "PAID") {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: "PAID",
              status: "CONFIRMED",
            },
          });

          console.log(`[TRANSFERMIT WEBHOOK] Order ${order.id} marked as PAID/CONFIRMED`);

          // Send details to Horolska Hub API
          await sendOrderToHub(order.id);

          // Send confirmation & invoice emails now that order is paid
          const emailPayload = {
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            items: order.items,
            subtotal: order.subtotal,
            taxAmount: order.taxAmount,
            shippingCost: order.shippingCost,
            discountAmount: order.discountAmount,
            total: order.total,
            shippingMethod: order.shippingMethod || "standard",
            shippingAddress: order.shippingAddress as Record<string, any> | null ?? undefined,
            createdAt: order.createdAt,
          };

          scheduleEmail(`order confirmation ${order.orderNumber}`, () => sendOrderConfirmationEmail(emailPayload));
          scheduleEmail(`order invoice ${order.orderNumber}`, () => sendOrderInvoiceEmail(emailPayload));
        }
        break;

      case "DECLINED":
      case "ERROR":
      case "CANCELLED":
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "FAILED",
            status: "CANCELLED",
          },
        });
        console.log(`[TRANSFERMIT WEBHOOK] Order ${order.id} marked as FAILED/CANCELLED due to payment state: ${state}`);
        break;

      case "PENDING":
      default:
        // Keep order PENDING
        console.log(`[TRANSFERMIT WEBHOOK] Order ${order.id} is in pending payment state: ${state}`);
        break;
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[TRANSFERMIT WEBHOOK] Error processing webhook:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
