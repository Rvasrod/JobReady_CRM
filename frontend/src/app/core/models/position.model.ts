export type PositionStatus = 'open' | 'paused' | 'closed';
export type Seniority = 'junior' | 'mid' | 'senior';
export type Modality = 'remote' | 'presential' | 'hybrid';

export interface Position {
  id: number;
  organizationId: number;
  title: string;
  department?: string;
  location?: string;
  salary?: string;
  modality?: Modality;
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
  salary?: string;
  modality?: Modality;
  seniority: Seniority;
  status: PositionStatus;
  description?: string;
  requirements?: string;
}