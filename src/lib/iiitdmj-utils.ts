/**
 * IIITDMJ Roll Number Parser
 * Format: [Year][Program][Branch][Serial]
 * Example: 24BCS201
 * 24 -> 2024 (Batch)
 * B -> B.Tech
 * CS -> CSE
 * 201 -> Roll No
 */

export interface IIITDMJInfo {
  batch: number;
  program: string;
  branch: string;
  rollNo: string;
  currentYear: number;
}

export function parseIIITDMJEmail(email: string): IIITDMJInfo | null {
  const prefix = email.split("@")[0].toUpperCase();
  // Regex to match IIITDMJ roll number pattern (e.g., 24BCS201)
  const match = prefix.match(/^(\d{2})([A-Z])([A-Z]{2})(\d{3})$/);

  if (!match) return null;

  const [_, yearShort, programCode, branchCode, rollNo] = match;
  
  const yearJoined = 2000 + parseInt(yearShort);
  const currentYearDate = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  // Academic year calculation (assuming session starts in July/August)
  let academicYear = currentYearDate - yearJoined;
  if (currentMonth >= 6) academicYear += 1; // If after July, they are in the next year

  const programs: Record<string, string> = {
    B: "B.Tech",
    M: "M.Tech",
    D: "B.Des",
    P: "Ph.D",
  };

  const branches: Record<string, string> = {
    CS: "Computer Science & Engineering",
    EC: "Electronics & Communication",
    ME: "Mechanical Engineering",
    DS: "Design",
    SM: "Smart Manufacturing",
  };

  return {
    batch: yearJoined,
    program: programs[programCode] || "Student",
    branch: branches[branchCode] || branchCode,
    rollNo: rollNo,
    currentYear: Math.max(1, Math.min(4, academicYear)), // Cap at 4 for B.Tech
  };
}
