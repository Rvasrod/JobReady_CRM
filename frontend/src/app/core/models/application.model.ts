export type ApplicationStatus = 
  | 'applied' 
  | 'cv_review' 
  | 'interview' 
  | 'technical_test' 
  | 'offer' 
  | 'hired' 
  | 'rejected';

export interface Application {
  id: number;
  organizationId: number;
  candidateId: number;
  positionId: number;
  candidateName: string;
  candidateEmail: string;
  candidateSeniority: string;
  positionTitle: string;
  status: ApplicationStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplicationFormData {
  candidateId: number;
  positionId: number;
  notes?: string;
}

export interface StatusUpdate {
  status: ApplicationStatus;
}