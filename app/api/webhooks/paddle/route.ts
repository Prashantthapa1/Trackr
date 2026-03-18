/**
 * app/api/webhooks/paddle/route.ts
 *
 * Paddle webhook handler. This is the most critical billing integration point.
 * Paddle sends POST requests here whenever a subscription event occurs
 * (created, updated, cancelled, payment failed). We:
 *
 * 1. Verify the webhook signature to prevent spoofing (Paddle signs each
 *    request with a shared secret).
 * 2. Parse the event type and extract the customer email.
 * 3. Map the email to our User record and update their plan accordingly.
 *
 * This route does NOT require authentication — Paddle must reach it
 * anonymously. That's why middleware.ts excludes /api/webhooks from auth.
 */
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { paddle } from "@/lib/paddle";
import type { EventEntity } from "@paddle/paddle-node-sdk";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("paddle-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Paddle signature" },
        { status: 400 }
      );
    }

    if (!paddle) {
      console.error("Paddle SDK not initialized");
      return NextResponse.json(
        { error: "Paddle not configured" },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event: EventEntity | null;
    try {
      const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error("PADDLE_WEBHOOK_SECRET not set");
      }
      event = paddle.webhooks.unmarshal(rawBody, webhookSecret, signature);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
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
      console.error("No customer email in webhook event:", event.eventType);
      return NextResponse.json({ received: true });
    }

    const subscriptionId = (eventData.id as string) ?? null;

    switch (event.eventType) {
      case "subscription.created":
      case "subscription.activated": {
        // User has successfully subscribed — upgrade to PRO
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
        // Subscription cancelled — downgrade to FREE
        // Note: Paddle sends this when the subscription actually ends,
        // not when the user clicks "cancel" (that's subscription.updated
        // with scheduled_change).
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
        // Could be a plan change, billing update, or scheduled cancellation
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
        // Payment succeeded — ensure user is PRO
        await prisma.user.update({
          where: { email: customerEmail },
          data: { plan: "PRO" },
        });
        console.log(`Payment completed for ${customerEmail}`);
        break;
      }

      case "transaction.payment_failed": {
        // Payment failed — log it but don't immediately downgrade
        // (Paddle will retry and eventually cancel)
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
