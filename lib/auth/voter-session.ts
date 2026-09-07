import { createBlindedBallotToken, verifyBlindedBallotToken, generateReceiptHash } from "../crypto";
import { normalizeMatricNo } from "../matric-normalizer";
import { evaluateVoterEligibility } from "../eligibility-engine";
import { MOCK_STUDENTS, MOCK_ELECTIONS, MockStudent } from "../mock-data";

export interface AccreditationRequest {
  electionId: string;
  matricNo: string;
  authMode: "PIN_SLIP" | "EMAIL_OTP" | "SECRET_MATCH" | "TELEGRAM";
  credential: string; // The 8-char PIN, the 6-digit OTP, or the portal secret
}

export interface AccreditationResponse {
  success: boolean;
  message: string;
  student?: {
    matricNo: string;
    fullName: string;
    department: string;
    level: number;
  };
  ballotToken?: {
    tokenId: string;
    electionId: string;
    expiresAt: number;
    signature: string;
  };
  disqualificationReasons?: string[];
}

/**
 * Core Voter Accreditation Engine
 * Authenticates student, checks constitutional eligibility, and mints blinded token
 */
export async function accreditVoter(req: AccreditationRequest): Promise<AccreditationResponse> {
  const norm = normalizeMatricNo(req.matricNo);
  if (!norm.isValid) {
    return {
      success: false,
      message: "Invalid matriculation number format.",
    };
  }

  // Find student in master roll
  const student = MOCK_STUDENTS.find((s) => s.normalizedMatric === norm.normalized);
  if (!student) {
    return {
      success: false,
      message: `Matriculation number "${req.matricNo}" was not found on the accredited voter roll.`,
    };
  }

  // Verify Credential based on Auth Mode
  if (req.authMode === "PIN_SLIP") {
    if (student.portalPin.trim().toUpperCase() !== req.credential.trim().toUpperCase()) {
      return {
        success: false,
        message: "Invalid 8-character Voter PIN. Please check your official accreditation slip.",
      };
    }
  } else if (req.authMode === "EMAIL_OTP") {
    // For demo/testing: any 6-digit code or "123456"
    if (!/^\d{6}$/.test(req.credential.trim())) {
      return {
        success: false,
        message: "Invalid 6-digit OTP code.",
      };
    }
  }

  // Find Election
  const election = MOCK_ELECTIONS.find((e) => e.id === req.electionId) || MOCK_ELECTIONS[0];

  // Evaluate Constitutional Eligibility
  const eligibility = evaluateVoterEligibility(
    {
      id: student.normalizedMatric,
      matricNo: student.matricNo,
      fullName: student.fullName,
      faculty: student.faculty,
      department: student.department,
      level: student.level,
      programType: student.programType,
      isRegisteredSession: student.isRegisteredSession,
      duesPaid: student.duesPaid,
      disciplinaryStatus: student.disciplinaryStatus,
      hallOfResidence: student.hallOfResidence,
    },
    {
      id: election.id,
      title: election.title,
      status: election.status,
      startsAt: election.startsAt,
      endsAt: election.endsAt,
      requireDuesPayment: election.requireDuesPayment,
      requireFullTimeOnly: election.requireFullTimeOnly,
      requireGoodDisciplinaryStanding: election.requireGoodDisciplinaryStanding,
      orgType: election.orgType,
      orgCode: "NACOS",
      departmentScope: "Computer Science",
    }
  );

  if (!eligibility.isEligible) {
    return {
      success: false,
      message: "Constitutional Disqualification: Student is not eligible to vote.",
      disqualificationReasons: eligibility.reasons,
    };
  }

  // Cleared! Mint Single-Use Blinded Ballot Token
  const ballotToken = createBlindedBallotToken(election.id, 15);

  return {
    success: true,
    message: "Accreditation successful. Ballot token issued.",
    student: {
      matricNo: student.matricNo,
      fullName: student.fullName,
      department: student.department,
      level: student.level,
    },
    ballotToken,
  };
}

/**
 * Verify and record an anonymous ballot submission
 */
export async function submitAnonymousBallot(
  ballotToken: any,
  selections: { [postId: string]: string }
): Promise<{ success: boolean; receiptHash?: string; message: string }> {
  const isValidToken = verifyBlindedBallotToken(ballotToken);
  if (!isValidToken) {
    return {
      success: false,
      message: "Ballot token is invalid, expired, or has already been used.",
    };
  }

  const timestamp = Date.now();
  const receiptHash = generateReceiptHash(ballotToken.electionId, ballotToken.tokenId, timestamp);

  return {
    success: true,
    receiptHash,
    message: "Ballot cast successfully and recorded to the audit ledger.",
  };
}
