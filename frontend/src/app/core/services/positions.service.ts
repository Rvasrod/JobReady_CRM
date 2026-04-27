import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Position, PositionFormData } from '../models/position.model';

interface ListResponse { success: boolean; data: Position[] }
interface ItemResponse { success: boolean; data: Position }

@Injectable({ providedIn: 'root' })
export class PositionsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/positions`;

  getAll(): Observable<{ data: Position[] }> {
    return this.http
      .get<ListResponse>(this.apiUrl)
      .pipe(map((res) => ({ data: res.data })));
  }

  getById(id: number | string): Observable<{ data: Position }> {
    return this.http
      .get<ItemResponse>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => ({ data: res.data })));
  }

  create(payload: PositionFormData): Observable<{ data: Position }> {
    return this.http
      .post<ItemResponse>(this.apiUrl, payload)
      .pipe(map((res) => ({ data: res.data })));
  }

  update(id: number | string, payload: PositionFormData): Observable<{ data: Position }> {
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