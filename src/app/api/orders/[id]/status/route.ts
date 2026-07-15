import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  sendOrderShippedEmail,
  sendOrderStatusEmail,
} from "@/lib/email";
import { scheduleEmail } from "@/lib/email-jobs";
import { createTransfermitRefund } from "@/lib/transfermit";

const statusSchema = z.object({
  status: z.enum([
    "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED",
  ]),
  trackingNumber: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = statusSchema.parse(body);

    const previous = await prisma.order.findUnique({
      where: { id },
      select: { status: true, paymentMethod: true, paymentId: true, total: true },
    });

    if (!previous) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If order status is set to REFUNDED and was paid via transfermit, trigger Transfermit Refund API
    if (
      validated.status === "REFUNDED" &&
      previous.status !== "REFUNDED" &&
      previous.paymentMethod === "transfermit" &&
      previous.paymentId
    ) {
      try {
        await createTransfermitRefund({
          paymentType: "REFUND",
          parentPaymentId: previous.paymentId,
          amount: Number(previous.total),
          currency: "EUR",
        });
      } catch (refundError) {
        console.error("[TRANSFERMIT REFUND] Failed to process automatic refund:", refundError);
        return NextResponse.json(
          { error: "Failed to process refund on Transfermit payment gateway." },
          { status: 502 }
        );
      }
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: validated.status,
        trackingNumber: validated.trackingNumber,
        paymentStatus:
          validated.status === "CANCELLED" || validated.status === "REFUNDED"
            ? "REFUNDED"
            : undefined,
      },
      include: { items: true },
    });


    const statusChanged = previous?.status !== order.status;
    if (statusChanged) {
      const payload = {
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
        shippingAddress: order.shippingAddress as Record<string, string> | null ?? undefined,
        trackingNumber: order.trackingNumber,
        createdAt: order.createdAt,
      };

      if (order.status === "SHIPPED") {
        scheduleEmail(`order shipped ${order.orderNumber}`, () => sendOrderShippedEmail(payload));
      } else if (
        order.status === "DELIVERED" ||
        order.status === "CANCELLED" ||
        order.status === "REFUNDED"
      ) {
        const status = order.status;
        scheduleEmail(`order ${status.toLowerCase()} ${order.orderNumber}`, () =>
          sendOrderStatusEmail(payload, status)
        );
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
