import { ApplicationStatus } from './application.model';

export interface PipelineItem {
  id: number;
  candidateId: number;
  candidateName: string;
  seniority: string;
  positionTitle: string;
  skills: string[];
}

export interface PipelineStage {
  status: ApplicationStatus;
  count: number;
  items: PipelineItem[];
}

export interface RecentApplication {
  id: number;
  candidateName: string;
  positionTitle: string;
  seniority: string;
  status: ApplicationStatus;
  updatedAt: string;
}

export interface DashboardStats {
  activeCandidates: number;
  openPositions: number;
  offersOut: number;
  hiredThisMonth: number;
  totalApplications: number;
  totalHired: number;
  totalRejected: number;
  conversionRate: number;
  avgDaysToHire: number;
  pipeline: PipelineStage[];
  recent: RecentApplication[];
}