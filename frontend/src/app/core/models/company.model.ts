export interface Company {
  id: number;
  userId: number;
  name: string;
  sector?: string;
  website?: string;
  notes?: string;
  rating?: number;
  createdAt?: string;
}

export type CompanyDraft = Partial<Omit<Company, 'id' | 'userId' | 'createdAt'>>;
