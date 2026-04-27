import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { StatsService } from '../../core/services/stats.service';
import { DashboardStats } from '../../core/models/stats.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>
      
      @if (loading()) {
        <p class="loading">Cargando métricas...</p>
      } @else if (stats()) {
        <div class="metrics-grid">
          <mat-card class="metric-card highlight">
            <mat-card-content>
              <mat-icon>people</mat-icon>
              <div class="metric-value">{{ stats()!.activeCandidates }}</div>
              <div class="metric-label">Candidatos activos</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="metric-card">
            <mat-card-content>
              <mat-icon>work</mat-icon>
              <div class="metric-value">{{ stats()!.openPositions }}</div>
              <div class="metric-label">Vacantes abiertas</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="metric-card">
            <mat-card-content>
              <mat-icon>local_offer</mat-icon>
              <div class="metric-value">{{ stats()!.offersOut }}</div>
              <div class="metric-label">Ofertas enviadas</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="metric-card hired">
            <mat-card-content>
              <mat-icon>celebration</mat-icon>
              <div class="metric-value">{{ stats()!.hiredThisMonth }}</div>
              <div class="metric-label">Contratados este mes</div>
            </mat-card-content>
          </mat-card>
        </div>

        <h2>Pipeline</h2>
        <div class="pipeline-grid">
          @for (stage of stats()!.pipeline; track stage.status) {
            <mat-card class="pipeline-card" [class]="stage.status">
              <mat-card-header>
                <mat-card-title>{{ statusLabel(stage.status) }}</mat-card-title>
                <span class="count">{{ stage.count }}</span>
              </mat-card-header>
              <mat-card-content>
                @for (item of stage.items; track item.id) {
                  <div class="pipeline-item">
                    <div class="candidate">{{ item.candidateName }}</div>
                    <div class="position">{{ item.positionTitle }}</div>
                  </div>
                }
                @if (stage.items.length === 0) {
                  <p class="empty">Sin candidatos</p>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>

        <h2>Recientes</h2>
        <mat-card class="recent-card">
          <mat-card-content>
            @if (stats()!.recent.length === 0) {
              <p class="empty">
                Sin actividad reciente. 
                <a routerLink="/candidates/new">Agregar candidato</a>
              </p>
            } @else {
              @for (app of stats()!.recent; track app.id) {
                <div class="recent-item">
                  <div class="main">
                    <strong>{{ app.candidateName }}</strong>
                    <span>{{ app.positionTitle }}</span>
                  </div>
                  <div class="meta">
                    <span class="status" [class]="app.status">{{ statusLabel(app.status) }}</span>
                    <span class="date">{{ app.updatedAt | date:'short' }}</span>
                  </div>
                </div>
              }
            }
          </mat-card-content>
        </mat-card>
      } @else {
        <p class="empty">No hay datos disponibles.</p>
      }
    </div>
  `,
  styles: [`
    .dashboard { padding: 24px; }
    h1 { margin: 0 0 24px; font-size: 28px; color: #1e293b; }
    h2 { font-size: 20px; color: #475569; margin: 32px 0 16px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .metric-card { text-align: center; }
    .metric-card.highlight { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; }
    .metric-card.hired { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; }
    .metric-card mat-icon { font-size: 40px; width: 40px; height: 40px; margin-bottom: 8px; }
    .metric-value { font-size: 36px; font-weight: 700; }
    .metric-label { font-size: 14px; opacity: 0.9; }
    .pipeline-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
    .pipeline-card { min-height: 200px; }
    .pipeline-card mat-card-header { display: flex; justify-content: space-between; align-items: center; }
    .pipeline-card .count { background: #e2e8f0; padding: 2px 10px; border-radius: 12px; font-size: 14px; }
    .pipeline-card.applied { border-top: 3px solid #64748b; }
    .pipeline-card.cv_review { border-top: 3px solid #8b5cf6; }
    .pipeline-card.interview { border-top: 3px solid #f59e0b; }
    .pipeline-card.technical_test { border-top: 3px solid #06b6d4; }
    .pipeline-card.offer { border-top: 3px solid #3b82f6; }
    .pipeline-item { padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
    .pipeline-item:last-child { border-bottom: none; }
    .pipeline-item .candidate { font-weight: 600; font-size: 14px; }
    .pipeline-item .position { font-size: 12px; color: #64748b; }
    .recent-card { margin-top: 16px; }
    .recent-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .recent-item:last-child { border-bottom: none; }
    .recent-item .main { display: flex; flex-direction: column; }
    .recent-item .main strong { font-size: 14px; }
    .recent-item .main span { font-size: 13px; color: #64748b; }
    .recent-item .meta { display: flex; gap: 12px; align-items: center; }
    .recent-item .status { padding: 4px 10px; border-radius: 12px; font-size: 12px; }
    .recent-item .status.applied { background: #f1f5f9; color: #475569; }
    .recent-item .status.cv_review { background: #ede9fe; color: #7c3aed; }
    .recent-item .status.interview { background: #fef3c7; color: #b45309; }
    .recent-item .status.technical_test { background: #cffafe; color: #0e7490; }
    .recent-item .status.offer { background: #dbeafe; color: #1d4ed8; }
    .recent-item .status.hired { background: #dcfce7; color: #166534; }
    .recent-item .status.rejected { background: #fee2e2; color: #b91c1c; }
    .recent-item .date { font-size: 12px; color: #94a3b8; }
    .empty { color: #64748b; text-align: center; padding: 24px; }
    .loading { color: #64748b; }
    a { color: #3b82f6; }
  `],
})
export class DashboardComponent implements OnInit {
  private statsService = inject(StatsService);

  stats = signal<DashboardStats | null>(null);
  loading = signal(true);

  private statusLabels: Record<string, string> = {
    applied: 'Aplicado',
    cv_review: 'Revisión CV',
    interview: 'Entrevista',
    technical_test: 'Prueba técnica',
    offer: 'Oferta',
    hired: 'Contratado',
    rejected: 'Rechazado',
  };

  ngOnInit(): void {
    this.statsService.getDashboard().subscribe({
      next: (data) => { this.stats.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  statusLabel(status: string): string {
    return this.statusLabels[status] || status;
  }
}