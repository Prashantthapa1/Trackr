/**
 * lib/paddle.ts
 *
 * Initializes the Paddle Node.js SDK for server-side operations like verifying
 * webhook signatures and making API calls. We use the sandbox environment
 * during development. The client-side Paddle.js is loaded separately via
 * a script tag on the upgrade page — this file is server-only.
 */
import { Environment, Paddle } from "@paddle/paddle-node-sdk";

const paddleApiKey = process.env.PADDLE_API_KEY;

if (!paddleApiKey) {
  console.warn("PADDLE_API_KEY not set — Paddle SDK will not be initialized");
}

export const paddle = paddleApiKey
  ? new Paddle(paddleApiKey, {
      environment:
        process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
          ? Environment.production
          : Environment.sandbox,
    })
  : null;
