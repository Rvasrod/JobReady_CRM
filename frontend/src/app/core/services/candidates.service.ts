import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Candidate, CandidateFormData } from '../models/candidate.model';

interface ListResponse { success: boolean; data: Candidate[] }
interface ItemResponse { success: boolean; data: Candidate }

@Injectable({ providedIn: 'root' })
export class CandidatesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/candidates`;

  getAll(): Observable<{ data: Candidate[] }> {
    return this.http
      .get<ListResponse>(this.apiUrl)
      .pipe(map((res) => ({ data: res.data })));
  }

  getById(id: number | string): Observable<{ data: Candidate }> {
    return this.http
      .get<ItemResponse>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => ({ data: res.data })));
  }

  create(payload: CandidateFormData): Observable<{ data: Candidate }> {
    return this.http
      .post<ItemResponse>(this.apiUrl, payload)
      .pipe(map((res) => ({ data: res.data })));
  }

  update(id: number | string, payload: CandidateFormData): Observable<{ data: Candidate }> {
    return this.http
      .put<ItemResponse>(`${this.apiUrl}/${id}`, payload)
      .pipe(map((res) => ({ data: res.data })));
  }

  delete(id: number | string): Observable<void> {
    return this.http
      .delete<{ success: boolean }>(`${this.apiUrl}/${id}`)
      .pipe(map(() => undefined));
  }
}