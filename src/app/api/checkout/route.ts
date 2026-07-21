import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validators/checkout";
import { getSessionUser } from "@/lib/auth";
import { resolveDiscount, markDiscountUsed } from "@/lib/discounts";
import { createTransfermitPayment } from "@/lib/transfermit";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();

    const body = await request.json();
    const validated = checkoutSchema.parse(body);
    const { items, locale = "en" } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!validated.contact.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItems = items.map((item: { productId: string; quantity: number; variantName?: string }) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);

      const itemTotal = Number(product.price) * item.quantity;
      subtotal += itemTotal;

      return {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        variantName: item.variantName || null,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
      };
    });

    const discount = await resolveDiscount({
      userId: user?.id ?? null,
      email: validated.contact.email,
      code: validated.discountCode ?? null,
    });

    const discountAmount = discount ? +(subtotal * (discount.percent / 100)).toFixed(2) : 0;
    const discountedSubtotal = subtotal - discountAmount;

    const taxAmount = 0;
    const shippingCost = discountedSubtotal >= 100 ? 0 : 5.99;
    const total = +(discountedSubtotal + shippingCost).toFixed(2);

    const order = await prisma.order.create({
      data: {
        userId: user?.id || null,
        customerName: `${validated.shipping.firstName} ${validated.shipping.lastName}`,
        customerEmail: validated.contact.email,
        customerPhone: validated.contact.phone,
        shippingAddress: validated.shipping,
        shippingMethod: validated.shippingMethod,
        shippingCost,
        subtotal,
        taxAmount,
        discountAmount,
        discountCode: discount?.code ?? null,
        discountPercent: discount?.percent ?? null,
        total,
        paymentMethod: "transfermit",
        items: { create: orderItems },
      },
      include: { items: true },
    });

    if (discount) {
      await markDiscountUsed(discount, user?.id ?? null);
    }

    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    // Determine client IP and dynamic site URL (useful for local testing with ngrok)
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const host = request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") || "http";
    const siteUrl = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || "https://electreia.co.uk");

    // Call Transfermit API to create payment
    let paymentResponse;
    try {
      paymentResponse = await createTransfermitPayment({
        paymentType: "DEPOSIT",
        paymentMethod: "BASIC_CARD",
        amount: total,
        currency: "EUR",
        description: `Order ${order.orderNumber} payment`,
        referenceId: order.id,
        customer: {
          referenceId: order.id,
          firstName: validated.shipping.firstName,
          lastName: validated.shipping.lastName,
          email: validated.contact.email,
          phone: validated.contact.phone || undefined,
          ip,
        },
        billingAddress: {
          addressLine1: validated.shipping.address1,
          addressLine2: validated.shipping.address2 || undefined,
          city: validated.shipping.city,
          countryCode: validated.shipping.country,
          postalCode: validated.shipping.postalCode,
          state: validated.shipping.province || undefined,
        },
        returnUrl: `${siteUrl}/${locale}/order/confirmed?orderId=${order.id}`,
        webhookUrl: `${siteUrl}/api/webhooks/transfermit`,
      });
    } catch (paymentError) {
      console.error("Transfermit payment creation failed, rolling back order:", paymentError);
      
      // Rollback order
      await prisma.order.delete({ where: { id: order.id } });
      
      // Put back stock
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity } },
        });
      }

      return NextResponse.json(
        { error: "Payment gateway integration error. Please try again." },
        { status: 502 }
      );
    }

    const redirectUrl = paymentResponse.result?.redirectUrl;
    const paymentId = paymentResponse.result?.id;

    // Update order with payment ID
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: paymentId || null,
      },
      include: { items: true },
    });

    return NextResponse.json({ order: updatedOrder, redirectUrl }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

