import { hashVoterPin } from "../crypto";

/**
 * Organization-Scoped High-Entropy Voter PIN Generator
 * Generates secure, unambiguous PINs prefixed by the organization code
 * (e.g. "NC-7K9M-3P8X" for NACOS, "NE-4B2L-9Q1Z" for NESA)
 */
const CHARSET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function generateSingleVoterPin(orgPrefix: string = "ST"): string {
  const cleanPrefix = orgPrefix.toUpperCase().slice(0, 3).replace(/[^A-Z]/g, "") || "ST";
  let result = `${cleanPrefix}-`;
  for (let i = 0; i < 8; i++) {
    if (i === 4) result += "-";
    const randomIndex = Math.floor(Math.random() * CHARSET.length);
    result += CHARSET[randomIndex];
  }
  return result; // E.g. "NC-7K9M-3P8X" or "NE-8M4Q-7B1X"
}

export interface GeneratedVoterSlip {
  matricNo: string;
  fullName: string;
  department: string;
  level: number;
  plainPin: string;
  pinHash: string;
}

export async function generateVoterPinBatch(
  students: Array<{ matricNo: string; fullName: string; department: string; level: number }>,
  orgPrefix: string = "ST"
): Promise<GeneratedVoterSlip[]> {
  const slips: GeneratedVoterSlip[] = [];

  for (const student of students) {
    const plainPin = generateSingleVoterPin(orgPrefix);
    const pinHash = await hashVoterPin(plainPin);
    slips.push({
      ...student,
      plainPin,
      pinHash,
    });
  }

  return slips;
}
