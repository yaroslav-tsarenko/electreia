import { prisma } from "@/lib/prisma";

/**
 * Sends order details to the external Horolska Hub API
 */
export async function sendOrderToHub(orderId: string) {
  const rawHubUrl = process.env.HUB_API_URL;
  const rawHubKey = process.env.HUB_API_KEY;

  if (!rawHubUrl || !rawHubKey) {
    console.warn("[HUB API] HUB_API_URL or HUB_API_KEY is not configured in .env");
    return;
  }

  const hubUrl = rawHubUrl.replace(/^["']|["']$/g, "");
  const hubKey = rawHubKey.replace(/^["']|["']$/g, "");

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      console.error(`[HUB API] Order ${orderId} not found`);
      return;
    }

    const shippingAddress = (order.shippingAddress as any) || {};

    const payload = {
      site_name: "Electreia",
      site_url: process.env.NEXT_PUBLIC_SITE_URL || "https://electreia.co.uk",
      order_id: order.orderNumber,
      admin_url: "",
      billing: {
        first_name: shippingAddress.firstName || "",
        last_name: shippingAddress.lastName || "",
        email: order.customerEmail || "",
        phone: order.customerPhone || "",
        address_1: shippingAddress.address1 || "",
        address_2: shippingAddress.address2 || "",
        city: shippingAddress.city || "",
        state: shippingAddress.province || "",
        postcode: shippingAddress.postalCode || "",
        country: shippingAddress.country || "",
      },
      items: order.items.map((item) => ({
        name: item.productName,
        qty: item.quantity,
        price: Number(item.price),
        total: Number(item.total),
      })),
      total: Number(order.total),
      currency: "EUR",
    };

    console.log(`[HUB API] Sending order ${order.orderNumber} to Hub at ${hubUrl}...`);

    const response = await fetch(hubUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${hubKey}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`[HUB API] Hub request failed (${response.status}): ${responseText}`);
    } else {
      console.log(`[HUB API] Order sent successfully to Hub: ${responseText}`);
    }
  } catch (error) {
    console.error("[HUB API] Error sending order to Hub:", error);
  }
}
