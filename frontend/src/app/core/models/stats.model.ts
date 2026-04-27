export interface SectorBucket { sector: string; count: number }
export interface RatingBucket { rating: number; count: number }
export interface RecentCompany {
  id: number;
  name: string;
  sector: string | null;
  rating: number | null;
  createdAt: string;
}

export interface DashboardStats {
  total: number;
  avgRating: number | string;
  bySector: SectorBucket[];
  byRating: RatingBucket[];
  recent: RecentCompany[];
}
