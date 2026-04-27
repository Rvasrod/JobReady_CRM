import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CandidatesService } from '../../core/services/candidates.service';
import { Candidate } from '../../core/models/candidate.model';

@Component({
  selector: 'candidates-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  template: `
    <div class="page">
      <div class="header">
        <h1>Candidatos</h1>
        <a routerLink="new" class="btn-primary">+ Nuevo Candidato</a>
      </div>
      
      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Buscar</mat-label>
          <input matInput [(ngModel)]="search" (input)="filter()" placeholder="Nombre, email o skill">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Seniority</mat-label>
          <mat-select [(ngModel)]="seniorityFilter" (selectionChange)="filter()">
            <mat-option value="">Todos</mat-option>
            <mat-option value="junior">Junior</mat-option>
            <mat-option value="mid">Mid</mat-option>
            <mat-option value="senior">Senior</mat-option>
          </mat-select>
        </mat-form-field>
        @if (hasFilters()) {
          <button mat-stroked-button (click)="clearFilters()">Limpiar</button>
        }
        <span class="count">{{ filteredItems().length }} de {{ items().length }}</span>
      </div>

      @if (loading()) {
        <div class="loading">Cargando...</div>
      } @else if (filteredItems().length === 0) {
        <div class="empty">
          <p>No hay candidatos</p>
          <a routerLink="new" class="btn-primary">Crear primer candidato</a>
        </div>
      } @else {
        <div class="grid">
          @for (candidate of filteredItems(); track candidate.id) {
            <mat-card class="card">
              <mat-card-header>
                <mat-card-title>{{ candidate.name }}</mat-card-title>
                <mat-card-subtitle>{{ candidate.email }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="tags">
                  <span class="tag">{{ candidate.seniority }}</span>
                  @for (skill of candidate.skills.slice(0, 3); track skill) {
                    <span class="tag skill">{{ skill }}</span>
                  }
                </div>
              </mat-card-content>
              <mat-card-actions>
                <a mat-button [routerLink]="[candidate.id]">Editar</a>
                <button mat-button color="warn" (click)="delete(candidate.id)">Eliminar</button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 28px; color: #1e293b; }
    .btn-primary { background: #3b82f6; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500; }
    .filters { display: flex; gap: 16px; margin-bottom: 24px; align-items: center; flex-wrap: wrap; }
    mat-form-field { flex: 1; max-width: 300px; }
    .count { color: #64748b; font-size: 14px; white-space: nowrap; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .card { margin-bottom: 0; }
    .tags { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
    .tag { background: #e2e8f0; padding: 4px 10px; border-radius: 12px; font-size: 12px; color: #475569; }
    .tag.skill { background: #dbeafe; color: #1d4ed8; }
    .loading, .empty { text-align: center; padding: 60px; color: #64748b; }
    .empty p { margin-bottom: 16px; }
  `],
})
export class CandidatesListComponent implements OnInit {
  private candidatesService = inject(CandidatesService);
  
  items = signal<Candidate[]>([]);
  filteredItems = signal<Candidate[]>([]);
  loading = signal(true);
  search = '';
  seniorityFilter = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.candidatesService.getAll().subscribe({
      next: (res) => {
        this.items.set(res.data);
        this.filteredItems.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  filter(): void {
    let result = this.items();
    if (this.search) {
      const s = this.search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(s) || 
        c.email.toLowerCase().includes(s) ||
        c.skills.some(skill => skill.toLowerCase().includes(s))
      );
    }
    if (this.seniorityFilter) {
      result = result.filter(c => c.seniority === this.seniorityFilter);
    }
    this.filteredItems.set(result);
  }

  clearFilters(): void {
    this.search = '';
    this.seniorityFilter = '';
    this.filteredItems.set(this.items());
  }

  hasFilters(): boolean {
    return !!(this.search || this.seniorityFilter);
  }

  delete(id: number): void {
    if (confirm('¿Eliminar candidato?')) {
      this.candidatesService.delete(id).subscribe(() => this.load());
    }
  }
}