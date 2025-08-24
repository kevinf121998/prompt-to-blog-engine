export interface Brief {
  problem: string;
  audience: string;
  povBullets: string[];   // min length 3
  evidence: string[];     // 0+
  cta: string;
  tone: "Professional" | "Conversational" | "Thought Leadership" | "Playful";
}

export type ToneType = "Professional" | "Conversational" | "Thought Leadership" | "Playful";

export interface BriefValidation {
  problem: boolean;
  audience: boolean;
  povBullets: boolean;
  cta: boolean;
  tone: boolean;
  isValid: boolean;
}
