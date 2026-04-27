import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardStats } from '../models/stats.model';

interface StatsResponse { success: boolean; data: DashboardStats }

@Injectable({ providedIn: 'root' })
export class StatsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/stats`;

  getDashboard(): Observable<DashboardStats> {
    return this.http.get<StatsResponse>(this.apiUrl).pipe(map((r) => r.data));
  }
}
