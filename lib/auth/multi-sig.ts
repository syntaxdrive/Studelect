import CryptoJS from "crypto-js";

export type MultiSigActionType =
  | "OPEN_POLLS"
  | "CLOSE_POLLS"
  | "EXTEND_VOTING_WINDOW"
  | "CERTIFY_RESULTS"
  | "DISQUALIFY_CANDIDATE";

export interface SignatureEntry {
  signerId: string;
  signerName: string;
  signerRole: string;
  signedAt: string;
  signatureHash: string;
}

export interface MultiSigProposal {
  id: string;
  electionId: string;
  actionType: MultiSigActionType;
  title: string;
  description: string;
  requiredSignatures: number;
  status: "PENDING" | "EXECUTED" | "REJECTED";
  signatures: SignatureEntry[];
  createdAt: string;
}

export const MOCK_PROPOSALS: MultiSigProposal[] = [
  {
    id: "prop-open-nacos-2026",
    electionId: "elec-nacos-2026",
    actionType: "OPEN_POLLS",
    title: "Commence Live Polls for NACOS 2026",
    description: "Authorize the official opening of voting booths and release of voter tokens.",
    requiredSignatures: 2,
    status: "EXECUTED",
    signatures: [
      {
        signerId: "admin-nacos-elcom",
        signerName: "NACOS ELCOM Chairman",
        signerRole: "ELCOM_CHAIRMAN",
        signedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        signatureHash: "0x8f2b3a9c7d1e0f4a5b6c7d8e9f0a1b2c3d4e5f6a",
      },
      {
        signerId: "admin-unilag-dsa",
        signerName: "Dean of Student Affairs (UNILAG)",
        signerRole: "INSTITUTION_ADMIN",
        signedAt: new Date(Date.now() - 3 * 3600 * 1000 + 5000).toISOString(),
        signatureHash: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b",
      },
    ],
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
];

export function createSignature(signerId: string, actionType: string, electionId: string): string {
  const payload = `${signerId}:${actionType}:${electionId}:${Date.now()}`;
  return "0x" + CryptoJS.SHA256(payload).toString().substring(0, 40);
}
