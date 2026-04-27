import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { PositionsService } from '../../core/services/positions.service';
import { ApplicationsService } from '../../core/services/applications.service';
import { Position } from '../../core/models/position.model';
import { Application, ApplicationStatus } from '../../core/models/application.model';

const STATUS_ORDER: ApplicationStatus[] = [
  'applied', 'cv_review', 'interview', 'technical_test', 'offer', 'hired', 'rejected'
];

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Aplicado',
  cv_review: 'Revisión CV',
  interview: 'Entrevista',
  technical_test: 'Prueba técnica',
  offer: 'Oferta',
  hired: 'Contratado',
  rejected: 'Rechazado',
};

@Component({
  selector: 'position-detail',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    MatMenuModule,
    MatTabsModule,
  ],
  template: `
    <div class="page">
      <div class="header">
        <button mat-button routerLink="/positions">
          <mat-icon>arrow_back</mat-icon> Volver a Vacantes
        </button>
      </div>

      @if (loading()) {
        <div class="loading">Cargando...</div>
      } @else if (position()) {
        <mat-card class="position-header">
          <mat-card-header>
            <mat-card-title>{{ position()!.title }}</mat-card-title>
            <mat-card-subtitle>
              {{ position()!.department }} · {{ position()!.location }} · 
              <span class="status-badge" [class]="position()!.status">{{ position()!.status }}</span>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="position-meta">
              @if (position()!.salary) {
                <span class="meta-item">💰 {{ position()!.salary }}</span>
              }
              @if (position()!.modality) {
                <span class="meta-item">🏠 {{ position()!.modality }}</span>
              }
              <span class="meta-item">📊 {{ applications().length }} candidatos</span>
            </div>
            @if (position()!.description) {
              <p class="description">{{ position()!.description }}</p>
            }
          </mat-card-content>
        </mat-card>

        <h2>Pipeline de Candidatos</h2>
        <div class="pipeline-grid">
          @for (stage of pipelineStages; track stage) {
            <mat-card class="pipeline-card">
              <mat-card-header>
                <mat-card-title>{{ statusLabel(stage) }}</mat-card-title>
                <span class="pipeline-badge">{{ getByStatus(stage).length }}</span>
              </mat-card-header>
              <mat-card-content>
                @for (app of getByStatus(stage); track app.id) {
                  <div class="candidate-card">
                    <div class="candidate-info">
                      <div class="avatar" [style.backgroundColor]="getAvatarColor(app.candidateName)">
                        {{ app.candidateName.charAt(0) }}
                      </div>
                      <div>
                        <div class="candidate-name">{{ app.candidateName }}</div>
                        <div class="candidate-email">{{ app.candidateEmail }}</div>
                        <div class="candidate-seniority">{{ app.candidateSeniority }}</div>
                      </div>
                    </div>
                    <div class="candidate-tags">
                      @for (skill of getSkills(app).slice(0, 3); track skill) {
                        <mat-chip class="skill-chip">{{ skill }}</mat-chip>
                      }
                    </div>
                    @if (stage !== 'hired' && stage !== 'rejected') {
                      <div class="actions">
                        <button mat-icon-button [matMenuTriggerFor]="menu">
                          <mat-icon>more_vert</mat-icon>
                        </button>
                        <mat-menu #menu="matMenu">
                          @for (next of getNextStages(stage); track next) {
                            <button mat-menu-item (click)="moveTo(app.id, next)">
                              → {{ statusLabel(next) }}
                            </button>
                          }
                        </mat-menu>
                      </div>
                    }
                  </div>
                }
                @if (getByStatus(stage).length === 0) {
                  <p class="empty">Sin candidatos</p>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      } @else {
        <div class="empty">Posición no encontrada</div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 24px; background: #f5f5f5; min-height: 100vh; }
    .header { margin-bottom: 16px; }
    .position-header { margin-bottom: 24px; }
    .position-header mat-card-subtitle { display: flex; align-items: center; gap: 8px; }
    .status-badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
    .status-badge.open { background: #dcfce7; color: #166534; }
    .status-badge.closed { background: #f1f5f9; color: #475569; }
    .status-badge.paused { background: #fef3c7; color: #92400e; }
    .position-meta { display: flex; gap: 16px; margin: 12px 0; }
    .meta-item { font-size: 13px; color: #64748b; }
    .description { font-size: 14px; color: #475569; margin-top: 8px; }
    
    h2 { font-size: 18px; font-weight: 500; color: #1e293b; margin: 0 0 16px; }
    
    .pipeline-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px; }
    .pipeline-card { min-height: 200px; }
    .pipeline-card mat-card-header { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f8fafc; }
    .pipeline-badge { background: #e2e8f0; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
    
    .candidate-card { padding: 12px; border-bottom: 1px solid #f1f5f9; position: relative; }
    .candidate-card:last-child { border-bottom: none; }
    .candidate-info { display: flex; gap: 10px; align-items: flex-start; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 14px; }
    .candidate-name { font-weight: 600; font-size: 13px; }
    .candidate-email { font-size: 11px; color: #64748b; }
    .candidate-seniority { font-size: 11px; color: #94a3b8; text-transform: capitalize; }
    .candidate-tags { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 8px; }
    .skill-chip { font-size: 10px; min-height: 20px; }
    .actions { position: absolute; top: 8px; right: 8px; }
    .empty { text-align: center; color: #94a3b8; font-size: 12px; padding: 20px; }
    .loading { text-align: center; padding: 40px; color: #64748b; }
  `],
})
export class PositionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private positionsService = inject(PositionsService);
  private applicationsService = inject(ApplicationsService);
  private snackBar = inject(MatSnackBar);

  position = signal<Position | null>(null);
  applications = signal<any[]>([]);
  loading = signal(true);
  pipelineStages = STATUS_ORDER;

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.positionsService.getById(id).subscribe({
      next: (res) => {
        this.position.set(res.data);
        this.loadApplications(+id);
      },
      error: () => this.loading.set(false),
    });
  }

  loadApplications(positionId: number): void {
    this.applicationsService.getAll().subscribe({
      next: (res) => {
        this.applications.set(res.data.filter((a: any) => a.positionId === positionId));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getByStatus(status: ApplicationStatus): any[] {
    return this.applications().filter(a => a.status === status);
  }

  statusLabel(status: ApplicationStatus): string {
    return STATUS_LABELS[status];
  }

  getNextStages(current: ApplicationStatus): ApplicationStatus[] {
    const idx = STATUS_ORDER.indexOf(current);
    return STATUS_ORDER.slice(idx + 1, idx + 3);
  }

  moveTo(id: number, status: ApplicationStatus): void {
    this.applicationsService.updateStatus(id, status).subscribe({
      next: () => {
        const positionId = this.position()?.id;
        if (positionId) this.loadApplications(positionId);
        this.snackBar.open('Candidato movido a ' + this.statusLabel(status), 'Cerrar', { duration: 2000 });
      },
      error: () => this.snackBar.open('Error al mover', 'Cerrar', { duration: 2000 }),
    });
  }

  getSkills(app: any): string[] {
    return app.skills || [];
  }

  getAvatarColor(name: string): string {
    const colors = ['#3f51b5', '#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0'];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  }
}