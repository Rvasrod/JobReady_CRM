import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PositionsService } from '../../core/services/positions.service';
import { Position, PositionStatus } from '../../core/models/position.model';

@Component({
  selector: 'positions-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  template: `
    <div class="page">
      <div class="header">
        <h1>Vacantes</h1>
        <a routerLink="new" class="btn-primary">+ Nueva Vacante</a>
      </div>

      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Buscar</mat-label>
          <input matInput [(ngModel)]="search" (input)="filter()" placeholder="Título o departamento">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Estado</mat-label>
          <mat-select [(ngModel)]="statusFilter" (selectionChange)="filter()">
            <mat-option value="">Todos</mat-option>
            <mat-option value="open">Abierta</mat-option>
            <mat-option value="paused">Pausada</mat-option>
            <mat-option value="closed">Cerrada</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Modalidad</mat-label>
          <mat-select [(ngModel)]="modalityFilter" (selectionChange)="filter()">
            <mat-option value="">Todas</mat-option>
            <mat-option value="remote">Remoto</mat-option>
            <mat-option value="presential">Presencial</mat-option>
            <mat-option value="hybrid">Híbrido</mat-option>
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
          <p>No hay vacantes</p>
          <a routerLink="new" class="btn-primary">Crear primera vacante</a>
        </div>
      } @else {
        <div class="grid">
          @for (position of filteredItems(); track position.id) {
            <mat-card class="card">
              <mat-card-header>
                <mat-card-title>{{ position.title }}</mat-card-title>
                <mat-card-subtitle>{{ position.department }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="meta">
                  <span class="chip" [class]="position.status">{{ position.status }}</span>
                  <span class="chip seniority">{{ position.seniority }}</span>
                  <span class="chip modality" [class]="position.modality">{{ position.modality }}</span>
                </div>
                <div class="details">
                  @if (position.location) {
                    <span class="detail">📍 {{ position.location }}</span>
                  }
                  @if (position.salary) {
                    <span class="detail">💰 {{ position.salary }}</span>
                  }
                </div>
              </mat-card-content>
              <mat-card-actions>
                <a mat-button [routerLink]="[position.id, 'candidates']">Candidatos</a>
                <a mat-button [routerLink]="[position.id]">Editar</a>
                <button mat-button color="warn" (click)="delete(position.id)">Eliminar</button>
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
    mat-form-field { width: 200px; }
    .count { color: #64748b; font-size: 14px; white-space: nowrap; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .card { margin-bottom: 0; }
    .meta { display: flex; gap: 8px; align-items: center; margin-top: 12px; flex-wrap: wrap; }
    .chip { padding: 4px 10px; border-radius: 12px; font-size: 12px; text-transform: capitalize; }
    .chip.open { background: #dcfce7; color: #166534; }
    .chip.paused { background: #fef3c7; color: #92400e; }
    .chip.closed { background: #f1f5f9; color: #475569; }
    .chip.seniority { background: #e2e8f0; color: #475569; }
    .chip.modality { background: #ede9fe; color: #7c3aed; }
    .chip.modality.remote { background: #dbeafe; color: #1d4ed8; }
    .chip.modality.hybrid { background: #fef3c7; color: #b45309; }
    .details { display: flex; gap: 16px; margin-top: 8px; flex-wrap: wrap; }
    .detail { font-size: 13px; color: #64748b; }
    .loading, .empty { text-align: center; padding: 60px; color: #64748b; }
    .empty p { margin-bottom: 16px; }
  `],
})
export class PositionsListComponent implements OnInit {
  private positionsService = inject(PositionsService);
  
  items = signal<Position[]>([]);
  filteredItems = signal<Position[]>([]);
  loading = signal(true);
  search = '';
  statusFilter: PositionStatus | '' = '';
  modalityFilter = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.positionsService.getAll().subscribe({
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
      result = result.filter(p => 
        p.title.toLowerCase().includes(s) || 
        (p.description && p.description.toLowerCase().includes(s)) ||
        (p.department && p.department.toLowerCase().includes(s))
      );
    }
    if (this.statusFilter) {
      result = result.filter(p => p.status === this.statusFilter);
    }
    if (this.modalityFilter) {
      result = result.filter(p => p.modality === this.modalityFilter);
    }
    this.filteredItems.set(result);
  }

  clearFilters(): void {
    this.search = '';
    this.statusFilter = '';
    this.modalityFilter = '';
    this.filteredItems.set(this.items());
  }

  hasFilters(): boolean {
    return !!(this.search || this.statusFilter || this.modalityFilter);
  }

  delete(id: number): void {
    if (confirm('¿Eliminar vacante?')) {
      this.positionsService.delete(id).subscribe(() => this.load());
    }
  }
}