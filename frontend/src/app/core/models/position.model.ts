export type PositionStatus = 'open' | 'paused' | 'closed';
export type Seniority = 'junior' | 'mid' | 'senior';

export interface Position {
  id: number;
  organizationId: number;
  title: string;
  department?: string;
  location?: string;
  seniority: Seniority;
  status: PositionStatus;
  description?: string;
  requirements?: string;
  createdAt?: string;
}

export interface PositionFormData {
  title: string;
  department?: string;
  location?: string;
  seniority: Seniority;
  status: PositionStatus;
  description?: string;
  requirements?: string;
}