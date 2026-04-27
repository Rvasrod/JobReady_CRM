import { Organization } from './organization.model';

export type UserRole = 'admin' | 'recruiter';

export interface User {
  id: number;
  name: string;
  email: string;
  organizationId: number;
  role: UserRole;
  organization?: Organization;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface MeResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    email: string;
    organizationId: number;
    role: UserRole;
    organizationName: string;
    organizationInviteCode: string;
  };
}