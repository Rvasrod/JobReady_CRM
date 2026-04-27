import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatChipsModule,
    MatTableModule,
    MatTabsModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="dashboard-container">
      <div class="header-section">
        <div>
          <h1 class="page-title">Pipeline de Candidatos</h1>
          <p class="page-subtitle">Gestión de procesos de selección activos</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/candidates/new">
          <mat-icon>add</mat-icon>
          Añadir candidato
        </button>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (stats()) {
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-wrapper">
                <mat-icon class="stat-icon">people</mat-icon>
              </div>
              <div class="stat-value">{{ stats()!.activeCandidates }}</div>
              <div class="stat-label">Candidatos activos</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-wrapper">
                <mat-icon class="stat-icon">work</mat-icon>
              </div>
              <div class="stat-value">{{ stats()!.openPositions }}</div>
              <div class="stat-label">Procesos abiertos</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-wrapper">
                <mat-icon class="stat-icon">send</mat-icon>
              </div>
              <div class="stat-value">{{ stats()!.offersOut }}</div>
              <div class="stat-label">Ofertas enviadas</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card highlight">
            <mat-card-content>
              <div class="stat-icon-wrapper">
                <mat-icon class="stat-icon">check_circle</mat-icon>
              </div>
              <div class="stat-value">{{ stats()!.hiredThisMonth }}</div>
              <div class="stat-label">Contratados este mes</div>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-tab-group animationDuration="200ms">
          <mat-tab label="Pipeline">
            <div class="pipeline-grid">
              @for (stage of pipelineStages; track stage.key) {
                <mat-card class="pipeline-card">
                  <mat-card-header>
                    <mat-card-title>{{ stage.label }}</mat-card-title>
                    <span class="pipeline-badge">{{ getByStatus(stage.key).length }}</span>
                  </mat-card-header>
                  <mat-card-content>
                    @for (item of getByStatus(stage.key).slice(0, 5); track item.id) {
                      <div class="pipeline-item">
                        <div class="item-name">{{ item.candidateName }}</div>
                        <div class="item-position">{{ item.positionTitle }}</div>
                        <div class="item-tags">
                          @for (skill of item.skills.slice(0, 2); track skill) {
                            <mat-chip class="skill-chip">{{ skill }}</mat-chip>
                          }
                          <mat-chip class="seniority-chip">{{ item.seniority }}</mat-chip>
                        </div>
                      </div>
                    }
                    @if (getByStatus(stage.key).length === 0) {
                      <p class="empty-pipeline">Sin candidatos</p>
                    }
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </mat-tab>

          <mat-tab label="Actividad Reciente">
            <mat-card class="table-card">
              <mat-card-content>
                <table mat-table [dataSource]="stats()!.recent" class="full-width-table">
                  <ng-container matColumnDef="candidate">
                    <th mat-header-cell *matHeaderCellDef>Candidato</th>
                    <td mat-cell *matCellDef="let row">
                      <div class="candidate-cell">
                        <div class="avatar" [style.backgroundColor]="getAvatarColor(row.candidateName)">
                          {{ row.candidateName.charAt(0) }}
                        </div>
                        <div>
                          <div class="candidate-name">{{ row.candidateName }}</div>
                          <div class="candidate-role">{{ row.seniority }}</div>
                        </div>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="position">
                    <th mat-header-cell *matHeaderCellDef>Puesto</th>
                    <td mat-cell *matCellDef="let row">{{ row.positionTitle }}</td>
                  </ng-container>

                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Estado</th>
                    <td mat-cell *matCellDef="let row">
                      <span class="status-chip" [class]="getStatusClass(row.status)">
                        {{ statusLabel(row.status) }}
                      </span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="updated">
                    <th mat-header-cell *matHeaderCellDef>Última actividad</th>
                    <td mat-cell *matCellDef="let row">{{ row.updatedAt | date:'shortDate' }}</td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Acción</th>
                    <td mat-cell *matCellDef="let row">
                      <button mat-stroked-button size="small">Ver</button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                </table>

                @if (stats()!.recent.length === 0) {
                  <div class="empty-table">
                    <mat-icon>inbox</mat-icon>
                    <p>Sin actividad reciente</p>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          </mat-tab>
        </mat-tab-group>
      } @else {
        <mat-card class="empty-card">
          <mat-card-content>
            <mat-icon class="empty-icon">bar_chart</mat-icon>
            <p>No hay datos disponibles</p>
            <button mat-raised-button color="primary" routerLink="/candidates/new">
              Crear primer candidato
            </button>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 24px; background: #f5f5f5; min-height: 100vh; }
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-title { font-size: 24px; font-weight: 500; color: rgba(0,0,0,0.87); margin: 0; }
    .page-subtitle { font-size: 14px; color: rgba(0,0,0,0.54); margin: 4px 0 0; }

    .loading-container { display: flex; justify-content: center; padding: 60px; }

    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { text-align: center; padding: 16px; }
    .stat-card.highlight { background: linear-gradient(135deg, #673ab7, #512da8); color: white; }
    .stat-card.highlight .stat-label { color: rgba(255,255,255,0.8); }
    .stat-icon-wrapper { margin-bottom: 8px; }
    .stat-icon { font-size: 32px; color: #673ab7; }
    .stat-card.highlight .stat-icon { color: white; }
    .stat-value { font-size: 32px; font-weight: 500; }
    .stat-label { font-size: 12px; color: rgba(0,0,0,0.54); }

    .pipeline-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; padding-top: 16px; }
    .pipeline-card { min-height: 250px; }
    .pipeline-card mat-card-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #e0e0e0; }
    .pipeline-card mat-card-title { font-size: 14px; font-weight: 500; }
    .pipeline-badge { background: #e0e0e0; padding: 2px 8px; border-radius: 12px; font-size: 12px; color: rgba(0,0,0,0.54); }

    .pipeline-item { padding: 12px; border-bottom: 1px solid #f5f5f5; }
    .pipeline-item:last-child { border-bottom: none; }
    .item-name { font-weight: 500; font-size: 14px; }
    .item-position { font-size: 12px; color: rgba(0,0,0,0.54); margin-bottom: 8px; }
    .item-tags { display: flex; gap: 4px; flex-wrap: wrap; }
    .skill-chip { font-size: 10px; min-height: 24px; }
    .seniority-chip { font-size: 10px; min-height: 24px; background: #e8eaf6; }
    .empty-pipeline { text-align: center; color: rgba(0,0,0,0.38); padding: 20px; font-size: 12px; }

    .table-card { margin-top: 16px; }
    .full-width-table { width: 100%; }
    .candidate-cell { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 500; }
    .candidate-name { font-weight: 500; }
    .candidate-role { font-size: 12px; color: rgba(0,0,0,0.54); }
    
    .status-chip { padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; }
    .s-applied { background: #e3f2fd; color: #1976d2; }
    .s-cv_review { background: #f3e5f5; color: #7b1fa2; }
    .s-interview { background: #fff3e0; color: #f57c00; }
    .s-technical_test { background: #e0f7fa; color: #00838f; }
    .s-offer { background: #e8f5e9; color: #388e3c; }
    .s-hired { background: #4caf50; color: white; }
    .s-rejected { background: #ffebee; color: #d32f2f; }

    .empty-table { text-align: center; padding: 40px; color: rgba(0,0,0,0.38); }
    .empty-table mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; }

    .empty-card { text-align: center; padding: 60px; }
    .empty-icon { font-size: 64px; width: 64px; height: 64px; color: rgba(0,0,0,0.38); margin-bottom: 16px; }
  `],
})
export class DashboardComponent implements OnInit {
  private statsService = inject(StatsService);
  private router = inject(Router);

  stats = signal<DashboardStats | null>(null);
  loading = signal(true);
  displayedColumns = ['candidate', 'position', 'status', 'updated', 'actions'];

  pipelineStages = [
    { key: 'applied' as const, label: 'Aplicados' },
    { key: 'cv_review' as const, label: 'Revisión CV' },
    { key: 'interview' as const, label: 'Entrevista' },
    { key: 'technical_test' as const, label: 'Prueba técnica' },
    { key: 'offer' as const, label: 'Oferta' },
  ];

  private statusLabels: Record<string, string> = {
    applied: 'Aplicado',
    cv_review: 'Revisión CV',
    interview: 'Entrevista',
    technical_test: 'Prueba técnica',
    offer: 'Oferta enviada',
    hired: 'Contratado',
    rejected: 'Rechazado',
  };

  private avatarColors = ['#3f51b5', '#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#e91e63'];

  ngOnInit(): void {
    this.statsService.getDashboard().subscribe({
      next: (data) => { this.stats.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  getByStatus(status: string): any[] {
    const pipeline = this.stats()?.pipeline || [];
    const stage = pipeline.find((s: any) => s.status === status);
    return stage?.items || [];
  }

  statusLabel(status: string): string {
    return this.statusLabels[status] || status;
  }

  getStatusClass(status: string): string {
    return 's-' + status;
  }

  getAvatarColor(name: string): string {
    const idx = name.charCodeAt(0) % this.avatarColors.length;
    return this.avatarColors[idx];
  }
}