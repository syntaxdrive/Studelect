/**
 * StudElect Voter Eligibility & Disqualification Evaluation Engine
 * 
 * Implements Nigerian university constitutional checks:
 * 1. Portal registration for current academic session
 * 2. Association dues compliance (Financial vs Non-Financial members)
 * 3. Students Disciplinary Committee (SDC) status (Cultism, Malpractice, Suspensions)
 * 4. Program type exclusions (Full-Time vs Part-Time/DLI/Sandwich)
 * 5. Jurisdictional boundaries (Faculty, Department, Hall of Residence)
 * 6. Academic Level restrictions (100L - 600L)
 * 7. Election timing & accreditation status
 */

export interface StudentProfile {
  id: string;
  matricNo: string;
  fullName: string;
  faculty: string;
  department: string;
  level: number;
  programType: "FULL_TIME" | "PART_TIME" | "DLI" | "SANDWICH" | "POSTGRADUATE";
  isRegisteredSession: boolean;
  duesPaid: boolean;
  disciplinaryStatus: "GOOD_STANDING" | "PROBATION" | "SUSPENDED" | "EXPELLED";
  hallOfResidence?: string | null;
}

export interface ElectionRules {
  id: string;
  title: string;
  status: "DRAFT" | "SCHEDULED" | "ACCREDITATION_OPEN" | "LIVE" | "CONCLUDED" | "AUDITED";
  startsAt: Date | string;
  endsAt: Date | string;
  requireDuesPayment: boolean;
  requireFullTimeOnly: boolean;
  requireGoodDisciplinaryStanding: boolean;
  orgType: "SUG" | "FACULTY" | "DEPARTMENT" | "HALL" | "CLUB";
  orgCode: string;
  facultyScope?: string | null;
  departmentScope?: string | null;
  hallScope?: string | null;
}

export interface PostRules {
  id: string;
  title: string;
  allowedLevels: number[];
  allowedDepartments: string[];
  genderRestriction?: string | null;
}

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
  flags: {
    unregisteredSession: boolean;
    unpaidDues: boolean;
    disciplinaryAction: boolean;
    partTimeExclusion: boolean;
    jurisdictionMismatch: boolean;
    electionClosed: boolean;
  };
}

export function evaluateVoterEligibility(
  student: StudentProfile,
  election: ElectionRules,
  alreadyVoted = false
): EligibilityResult {
  const reasons: string[] = [];
  const flags = {
    unregisteredSession: false,
    unpaidDues: false,
    disciplinaryAction: false,
    partTimeExclusion: false,
    jurisdictionMismatch: false,
    electionClosed: false,
  };

  const now = new Date();
  const startsAt = new Date(election.startsAt);
  const endsAt = new Date(election.endsAt);

  // 1. Check Election Status & Time Window
  if (election.status === "CONCLUDED" || now > endsAt) {
    flags.electionClosed = true;
    reasons.push("Voting has concluded for this election.");
  } else if (
    election.status &&
    election.status !== "LIVE" &&
    election.status !== "ACCREDITATION_OPEN"
  ) {
    flags.electionClosed = true;
    reasons.push(`Election is currently ${election.status.toLowerCase()}. Voting has not commenced.`);
  }
  // If status is undefined/null, treat as LIVE (elections created via wizard default to active)

  // 2. Check If Already Voted
  if (alreadyVoted) {
    reasons.push("A ballot has already been cast using this student identity.");
  }

  // 3. Portal Registration
  if (!student.isRegisteredSession) {
    flags.unregisteredSession = true;
    reasons.push("Ineligible: Student has not completed official portal registration for the current academic session.");
  }

  // 4. Financial Compliance (Dues Payment)
  if (election.requireDuesPayment && !student.duesPaid) {
    flags.unpaidDues = true;
    reasons.push(`Ineligible: Outstanding association dues for ${election.orgCode}. Only financial members with verified dues receipts are accredited.`);
  }

  // 5. Disciplinary Standing (SDC Clearance)
  if (election.requireGoodDisciplinaryStanding && student.disciplinaryStatus !== "GOOD_STANDING") {
    flags.disciplinaryAction = true;
    reasons.push(`Ineligible: Student is currently under ${student.disciplinaryStatus} standing by the Students' Disciplinary Committee.`);
  }

  // 6. Program Type (Full-Time vs Part-Time/Sandwich)
  if (election.requireFullTimeOnly && student.programType !== "FULL_TIME") {
    flags.partTimeExclusion = true;
    reasons.push(`Ineligible: Constitution restricts participation to regular full-time undergraduate students (Current: ${student.programType}).`);
  }

  // 7. Jurisdictional Scope Checks (Faculty / Department / Hall)
  if (election.orgType === "DEPARTMENT" && election.departmentScope) {
    if (student.department.toLowerCase() !== election.departmentScope.toLowerCase()) {
      flags.jurisdictionMismatch = true;
      reasons.push(`Jurisdiction Mismatch: This departmental election is restricted to students of ${election.departmentScope} (Your department: ${student.department}).`);
    }
  }

  if (election.orgType === "FACULTY" && election.facultyScope) {
    if (student.faculty.toLowerCase() !== election.facultyScope.toLowerCase()) {
      flags.jurisdictionMismatch = true;
      reasons.push(`Jurisdiction Mismatch: This faculty election is restricted to students of ${election.facultyScope} (Your faculty: ${student.faculty}).`);
    }
  }

  if (election.orgType === "HALL" && election.hallScope) {
    if (!student.hallOfResidence || student.hallOfResidence.toLowerCase() !== election.hallScope.toLowerCase()) {
      flags.jurisdictionMismatch = true;
      reasons.push(`Hall Allocation Mismatch: This hall election is restricted to allocated residents of ${election.hallScope}.`);
    }
  }

  return {
    isEligible: reasons.length === 0,
    reasons,
    flags,
  };
}

/**
 * Check if an eligible voter can vote for a specific Post within an election
 * (e.g. 200L Class Rep only visible to 200L students)
 */
export function isStudentEligibleForPost(student: StudentProfile, post: PostRules): boolean {
  // Check Level Filter
  if (post.allowedLevels && post.allowedLevels.length > 0) {
    if (!post.allowedLevels.includes(student.level)) {
      return false;
    }
  }

  // Check Department Filter
  if (post.allowedDepartments && post.allowedDepartments.length > 0) {
    const deptMatch = post.allowedDepartments.some(
      (dept) => dept.toLowerCase() === student.department.toLowerCase()
    );
    if (!deptMatch) {
      return false;
    }
  }

  return true;
}
