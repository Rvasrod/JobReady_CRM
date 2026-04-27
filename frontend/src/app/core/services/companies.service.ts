import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Company, CompanyDraft } from '../models/company.model';

interface ListResponse { companies: Company[] }
interface ItemResponse { company: Company }

@Injectable({ providedIn: 'root' })
export class CompaniesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/companies`;

  getAll(): Observable<{ data: Company[] }> {
    return this.http
      .get<ListResponse>(this.apiUrl)
      .pipe(map((res) => ({ data: res.companies })));
  }

  getById(id: number | string): Observable<{ data: Company }> {
    return this.http
      .get<ItemResponse>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => ({ data: res.company })));
  }

  create(payload: CompanyDraft): Observable<{ data: Company }> {
    return this.http
      .post<ItemResponse>(this.apiUrl, payload)
      .pipe(map((res) => ({ data: res.company })));
  }

  update(id: number | string, payload: CompanyDraft): Observable<{ data: Company }> {
    return this.http
      .put<ItemResponse>(`${this.apiUrl}/${id}`, payload)
      .pipe(map((res) => ({ data: res.company })));
  }

  delete(id: number | string): Observable<void> {
    return this.http
      .delete<{ message: string }>(`${this.apiUrl}/${id}`)
      .pipe(map(() => undefined));
  }
}
