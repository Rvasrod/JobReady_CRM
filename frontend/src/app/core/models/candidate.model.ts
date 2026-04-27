export type Seniority = 'junior' | 'mid' | 'senior';

export interface Candidate {
  id: number;
  organizationId: number;
  name: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  seniority: Seniority;
  skills: string[];
  notes?: string;
  createdBy: number;
  createdAt?: string;
}

export interface CandidateFormData {
  name: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  seniority: Seniority;
  skills: string[];
  notes?: string;
}