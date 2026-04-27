import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Application, ApplicationFormData, ApplicationStatus } from '../models/application.model';

interface ListResponse { success: boolean; data: Application[] }
interface ItemResponse { success: boolean; data: Application }

@Injectable({ providedIn: 'root' })
export class ApplicationsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/applications`;

  getAll(): Observable<{ data: Application[] }> {
    return this.http
      .get<ListResponse>(this.apiUrl)
      .pipe(map((res) => ({ data: res.data })));
  }

  getById(id: number | string): Observable<{ data: Application }> {
    return this.http
      .get<ItemResponse>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => ({ data: res.data })));
  }

  create(payload: ApplicationFormData): Observable<{ data: Application }> {
    return this.http
      .post<ItemResponse>(this.apiUrl, payload)
      .pipe(map((res) => ({ data: res.data })));
  }

  updateStatus(id: number | string, status: ApplicationStatus): Observable<{ data: Application }> {
    return this.http
      .patch<ItemResponse>(`${this.apiUrl}/${id}/status`, { status })
      .pipe(map((res) => ({ data: res.data })));
  }

  delete(id: number | string): Observable<void> {
    return this.http
      .delete<{ success: boolean }>(`${this.apiUrl}/${id}`)
      .pipe(map(() => undefined));
  }
}