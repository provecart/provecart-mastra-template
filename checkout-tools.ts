/**
 * Example: Mastra tools for a ProveCart-gated checkout.
 *
 * createCheckoutMandate turns the customer's instructions into a
 * signed mandate; checkCartBeforePayment compares a built cart to
 * that mandate. An agent (or workflow step) may capture payment
 * only on a "proceed" route; "fix" carries the exact corrections;
 * "escalate" hands the decision to the buyer.
 */
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { createMandate, routeVerdict, verifyCart } from "./provecart";

const apiKey = () => {
  const k = process.env.PROVECART_API_KEY;
  if (!k) throw new Error("set PROVECART_API_KEY (your integrator key)");
  return k;
};

export const createCheckoutMandate = createTool({
  id: "create-checkout-mandate",
  description:
    "Create a ProveCart mandate from the customer's signed " +
    "instructions (item, category, price ceiling, quantity limit, " +
    "merchant allowlist, expiry). Returns the mandate id to check " +
    "the built cart against.",
  inputSchema: z.object({
    user_id: z.string(),
    item_description: z.string(),
    category: z.string(),
    max_total_price: z.number(),
    currency: z.string().default("USD"),
    max_quantity: z.number().optional(),
    brand: z.string().optional(),
    expires_at: z.string(),
  }),
  outputSchema: z.object({ mandate_id: z.string() }),
  execute: async ({ context }) => {
    const m = await createMandate(apiKey(), context);
    return { mandate_id: (m as { id: string }).id };
  },
});

export const checkCartBeforePayment = createTool({
  id: "check-cart-before-payment",
  description:
    "Check a built cart against the customer's mandate with " +
    "ProveCart before payment. Returns proceed (capture may run), " +
    "fix (apply the named corrections and resubmit), or escalate " +
    "(the buyer must decide). Never capture on fix or escalate.",
  inputSchema: z.object({
    mandate_id: z.string(),
    merchant: z.object({ name: z.string(), domain: z.string() }),
    items: z.array(z.object({
      name: z.string(), quantity: z.number(), unit_price: z.number(),
    })),
    total_price: z.number(),
    currency: z.string().default("USD"),
    previous_record_id: z.string().optional(),
  }),
  outputSchema: z.object({
    decision: z.enum(["proceed", "fix", "escalate"]),
    record_id: z.string().optional(),
    corrections: z.array(z.object({}).passthrough()).optional(),
    reason: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const res = await verifyCart(apiKey(), context);
    const route = routeVerdict(res);
    return route.decision === "fix"
      ? { decision: "fix", record_id: route.record_id, corrections: route.corrections }
      : route.decision === "proceed"
        ? { decision: "proceed", record_id: route.record_id }
        : { decision: "escalate", record_id: route.record_id, reason: route.reason };
  },
});
