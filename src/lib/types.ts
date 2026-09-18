export type RiskSeverity = 'High' | 'Medium' | 'Low';
export type ContractStatus = 'pending' | 'analyzing' | 'completed' | 'failed';

export interface Obligation {
  id: string;
  obligation: string;
  responsible_party: string;
  deadline: string;
  priority: RiskSeverity;
  category: string;
  evidence: string;
  page_number: number | null;
}

export interface Deadline {
  id: string;
  deadline: string;
  description: string;
  responsible_party: string;
  status: 'Upcoming' | 'Overdue' | 'Completed' | 'Not specified';
  evidence: string;
  page_number: number | null;
}

export interface ComplianceRisk {
  id: string;
  risk_title: string;
  description: string;
  severity: RiskSeverity;
  why_flagged: string;
  responsible_party: string;
  relevant_deadline: string;
  evidence: string;
  page_number: number | null;
  inferred: boolean;
}

export interface ContractAnalysis {
  summary: string;
  obligations: Obligation[];
  deadlines: Deadline[];
  compliance_risks: ComplianceRisk[];
  overall_risk: RiskSeverity;
}

export interface ContractRecord {
  id: string;
  name: string;
  file_size: number;
  page_count: number;
  raw_text: string | null;
  analysis: ContractAnalysis | null;
  overall_risk: RiskSeverity;
  status: ContractStatus;
  created_at: string;
  updated_at: string;
}
