// TPA branding — platform is customised per TPA; current demo: AKNA

export const currentTpa = {
  id: "akna",
  name: "AKNA",
  tagline: "AI Copilot for pre-auth, fraud detection & IRDAI compliance",
} as const;

export type TpaId = (typeof currentTpa)["id"];
