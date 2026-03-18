/**
 * app/api/webhooks/paddle/route.ts
 *
 * Paddle webhook handler for Paddle Billing API.
 * Verifies webhook signatures and updates user subscription status.
 *
 * This route does NOT require authentication — Paddle must reach it
 * anonymously. That's why middleware.ts excludes /api/webhooks from auth.
 */
import { NextResponse, type NextRequest } from "next/server";
import { paddle } from "@/lib/paddle";
import { prisma } from "@/lib/prisma";
import type { EventEntity } from "@paddle/paddle-node-sdk";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // CRITICAL: Use raw body string, NOT parsed JSON
    const rawBody = await request.text();

    const signature = request.headers.get("paddle-signature");
    if (!signature) {
      console.error("Missing paddle-signature header");
      return NextResponse.json(
        { error: "Missing Paddle signature" },
        { status: 400 }
      );
    }

    if (!paddle) {
      console.error("Paddle SDK not initialized - check PADDLE_API_KEY");
      return NextResponse.json(
        { error: "Paddle not configured" },
        { status: 500 }
      );
    }

    // Verify and parse webhook
    let event: EventEntity | null = null;

    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

    if (webhookSecret) {
      // Production: Verify signature with webhook secret
      try {
        event = paddle.webhooks.unmarshal(rawBody, webhookSecret, signature);
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 400 }
        );
      }
    } else {
      // Development/Sandbox: Parse without verification (NOT recommended for production)
      console.warn("PADDLE_WEBHOOK_SECRET not set - parsing without verification");
      try {
        const parsed = JSON.parse(rawBody);
        event = {
          eventId: parsed.event_id,
          eventType: parsed.event_type,
          occurredAt: parsed.occurred_at,
          notificationId: parsed.notification_id,
          data: parsed.data,
        } as EventEntity;
      } catch (err) {
        console.error("Failed to parse webhook body:", err);
        return NextResponse.json(
          { error: "Invalid webhook body" },
          { status: 400 }
        );
      }
    }

    if (!event) {
      return NextResponse.json(
        { error: "Failed to parse webhook event" },
        { status: 400 }
      );
    }

    console.log("Paddle webhook event:", event.eventType);

    // Extract customer email from the event data
    const eventData = event.data as unknown as Record<string, unknown>;
    const customerEmail =
      (eventData.customerEmail as string) ??
      ((eventData.customer as Record<string, unknown>)?.email as string) ??
      null;

    if (!customerEmail) {
      console.log("No customer email in webhook event:", event.eventType);
      return NextResponse.json({ received: true });
    }

    const subscriptionId = (eventData.id as string) ?? null;

    switch (event.eventType) {
      case "subscription.created":
      case "subscription.activated": {
        await prisma.user.update({
          where: { email: customerEmail },
          data: {
            plan: "PRO",
            subscriptionId,
          },
        });
        console.log(`Upgraded ${customerEmail} to PRO`);
        break;
      }

      case "subscription.canceled": {
        await prisma.user.update({
          where: { email: customerEmail },
          data: {
            plan: "FREE",
            subscriptionId: null,
          },
        });
        console.log(`Downgraded ${customerEmail} to FREE`);
        break;
      }

      case "subscription.updated": {
        const status = eventData.status as string;
        if (status === "canceled" || status === "past_due") {
          await prisma.user.update({
            where: { email: customerEmail },
            data: {
              plan: "FREE",
              subscriptionId: null,
            },
          });
          console.log(`Downgraded ${customerEmail} to FREE (${status})`);
        }
        break;
      }

      case "transaction.completed": {
        await prisma.user.update({
          where: { email: customerEmail },
          data: { plan: "PRO" },
        });
        console.log(`Payment completed for ${customerEmail}`);
        break;
      }

      case "transaction.payment_failed": {
        console.warn(`Payment failed for ${customerEmail}`);
        break;
      }

      default:
        console.log(`Unhandled Paddle event: ${event.eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
