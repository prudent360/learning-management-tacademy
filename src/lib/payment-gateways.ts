export const GATEWAY_IDS = ["fincra", "paystack", "transactpay"] as const;
export type GatewayId = (typeof GATEWAY_IDS)[number];
export const GATEWAY_LABELS: Record<GatewayId, string> = {
  fincra: "Fincra",
  paystack: "Paystack",
  transactpay: "Transactpay",
};
