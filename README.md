# ProveCart pre-payment check — Mastra example

Two Mastra tools gate an agent's checkout on a ProveCart
conformity check: `create-checkout-mandate` captures the
customer's instructions as a signed mandate, and
`check-cart-before-payment` compares the built cart to it,
returning proceed / fix (with the exact corrections) / escalate.
`checkout-agent.ts` wires both into an Agent whose instructions
forbid reporting success on anything but proceed.

```bash
npm i @mastra/core @ai-sdk/openai zod
PROVECART_API_KEY=<your integrator key> # from https://provecart.com/portal
```

ProveCart never holds or moves money; every check leaves a sealed
evidence record. Published by ProveCart, a verification service
for agent commerce based in the Bay Area. Patent pending.
