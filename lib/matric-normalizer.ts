/**
 * Nigerian Tertiary Institution Matriculation Number Normalizer & Validator
 * 
 * Handles common Nigerian university formats:
 * - Slash separated: "20/52HA012", "FSC/CSC/19/004", "UI/2019/1234"
 * - Hyphen separated: "20-52HA-012", "FSC-CSC-19-004"
 * - Compact alphanumeric: "2052HA012", "190408012"
 * - Spaced / messy entries: " 20 / 52ha 012 "
 */

export interface NormalizedMatricResult {
  raw: string;
  normalized: string;
  displayFormatted: string;
  isValid: boolean;
  estimatedYear?: number;
}

export function normalizeMatricNo(rawInput: string): NormalizedMatricResult {
  if (!rawInput || typeof rawInput !== "string") {
    return {
      raw: "",
      normalized: "",
      displayFormatted: "",
      isValid: false,
    };
  }

  const raw = rawInput.trim();
  // Strip all non-alphanumeric characters (slashes, hyphens, dots, spaces, backslashes) and uppercase
  const compact = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  // Universal tertiary institution validation:
  // Supports numeric-only (e.g. UNILAG '190408012', UI '200105'),
  // slash/hyphen separated (e.g. UNILORIN '20/52HA012', FUTA 'CSC/19/004', UNN 'UNN/2020/45678'),
  // polytechnic ND/HND formats (e.g. 'F/ND/21/3210045'), and short IDs (3 to 30 chars).
  const isValid = /^[A-Z0-9]{3,30}$/.test(compact);

  // Try to extract estimated year if starts with 2 digits or has 4-digit year
  let estimatedYear: number | undefined;
  const fourDigitYear = raw.match(/\b(20\d{2})\b/);
  if (fourDigitYear) {
    estimatedYear = parseInt(fourDigitYear[1], 10);
  } else {
    const yearMatch = compact.match(/^(\d{2})/);
    if (yearMatch) {
      const yr = parseInt(yearMatch[1], 10);
      estimatedYear = yr >= 15 && yr <= 35 ? 2000 + yr : undefined;
    }
  }

  // Format cleanly for display
  let displayFormatted = raw.toUpperCase().replace(/\s+/g, "");

  return {
    raw,
    normalized: compact,
    displayFormatted,
    isValid,
    estimatedYear,
  };
}

/**
 * Compare two matric numbers regardless of format differences
 */
export function areMatricNumbersEqual(a: string, b: string): boolean {
  const normA = normalizeMatricNo(a).normalized;
  const normB = normalizeMatricNo(b).normalized;
  return normA.length > 0 && normA === normB;
}
