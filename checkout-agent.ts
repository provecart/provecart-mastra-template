/**
 * Example agent wiring: a Mastra Agent that must pass the
 * ProveCart check before it reports a purchase as done.
 */
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import {
  checkCartBeforePayment,
  createCheckoutMandate,
} from "./checkout-tools";

export const checkoutAgent = new Agent({
  name: "Gated Checkout Agent",
  instructions:
    "You buy exactly what the customer asked for. First call " +
    "create-checkout-mandate with their instructions. Build the " +
    "cart, then call check-cart-before-payment. Report success " +
    "only on decision=proceed. On fix, apply only the named " +
    "corrections and check again. On escalate, stop and tell the " +
    "buyer what needs their decision.",
  model: openai("gpt-5"),
  tools: { createCheckoutMandate, checkCartBeforePayment },
});
