import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { ApplicationsService } from '../../core/services/applications.service';
import { CandidatesService } from '../../core/services/candidates.service';
import { PositionsService } from '../../core/services/positions.service';
import { Application, ApplicationStatus, ApplicationFormData } from '../../core/models/application.model';
import { Candidate } from '../../core/models/candidate.model';
import { Position } from '../../core/models/position.model';

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Aplicado',
  cv_review: 'Revisión CV',
  interview: 'Entrevista',
  technical_test: 'Prueba técnica',
  offer: 'Oferta',
  hired: 'Contratado',
  rejected: 'Rechazado',
};

const STATUS_ORDER: ApplicationStatus[] = [
  'applied', 'cv_review', 'interview', 'technical_test', 'offer', 'hired', 'rejected'
];

@Component({
  selector: 'applications-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatMenuModule,
  ],
  template: `
    <div class="page">
      <div class="header">
        <h1>Pipeline de Reclutamiento</h1>
        <button class="btn-primary" (click)="showNewForm = !showNewForm">+ Nueva Postulación</button>
      </div>

      @if (showNewForm) {
        <mat-card class="new-form">
          <mat-card-header>
            <mat-card-title>Nueva Postulación</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form (ngSubmit)="createApplication()">
              <mat-form-field appearance="outline">
                <mat-label>Candidato</mat-label>
                <mat-select [(ngModel)]="newApp.candidateId" name="candidate">
                  @for (c of candidates(); track c.id) {
                    <mat-option [value]="c.id">{{ c.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Vacante</mat-label>
                <mat-select [(ngModel)]="newApp.positionId" name="position">
                  @for (p of positions(); track p.id) {
                    <mat-option [value]="p.id">{{ p.title }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Notas</mat-label>
                <textarea matInput [(ngModel)]="newApp.notes" name="notes"></textarea>
              </mat-form-field>
              <div class="actions">
                <button mat-button type="button" (click)="showNewForm = false">Cancelar</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="!newApp.candidateId || !newApp.positionId">Crear</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }

      @if (loading()) {
        <div class="loading">Cargando...</div>
      } @else {
        <div class="pipeline">
          @for (stage of pipelineStages; track stage) {
            <div class="column" [class]="stage">
              <div class="column-header">
                <span class="label">{{ statusLabel(stage) }}</span>
                <span class="count">{{ getByStatus(stage).length }}</span>
              </div>
              <div class="column-content">
                @for (app of getByStatus(stage); track app.id) {
                  <mat-card class="app-card">
                    <div class="app-candidate">{{ app.candidateName }}</div>
                    <div class="app-position">{{ app.positionTitle }}</div>
                    @if (stage !== 'hired' && stage !== 'rejected') {
                      <div class="stage-actions">
                        <button mat-icon-button [matMenuTriggerFor]="menu" class="move-btn">
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
                  </mat-card>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 28px; color: #1e293b; }
    .btn-primary { background: #3b82f6; color: white; padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: 500; }
    .new-form { margin-bottom: 24px; max-width: 400px; }
    mat-form-field { width: 100%; margin-bottom: 8px; }
    .actions { display: flex; justify-content: flex-end; gap: 12px; }
    .pipeline { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 16px; }
    .column { flex: 1; min-width: 200px; background: #f1f5f9; border-radius: 8px; }
    .column-header { padding: 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
    .column-header .label { font-weight: 600; font-size: 14px; }
    .column-header .count { background: #cbd5e1; padding: 2px 8px; border-radius: 10px; font-size: 12px; }
    .column-content { padding: 12px; min-height: 200px; }
    .app-card { margin-bottom: 12px; padding: 12px; background: white; border-left: 3px solid #3b82f6; }
    .app-candidate { font-weight: 600; font-size: 14px; }
    .app-position { font-size: 13px; color: #64748b; }
    .stage-actions { margin-top: 8px; text-align: right; }
    .move-btn { width: 28px; height: 28px; }
    .loading { text-align: center; padding: 60px; color: #64748b; }
    .column.hired .app-card { border-left-color: #22c55e; background: #f0fdf4; }
    .column.rejected .app-card { border-left-color: #ef4444; background: #fef2f2; }
  `],
})
export class ApplicationsListComponent implements OnInit {
  private appsService = inject(ApplicationsService);
  private candidatesService = inject(CandidatesService);
  private positionsService = inject(PositionsService);
  private snackBar = inject(MatSnackBar);

  items = signal<Application[]>([]);
  candidates = signal<Candidate[]>([]);
  positions = signal<Position[]>([]);
  loading = signal(true);
  showNewForm = false;
  
  pipelineStages: ApplicationStatus[] = STATUS_ORDER;
  
  newApp: ApplicationFormData = { candidateId: 0, positionId: 0, notes: '' };

  ngOnInit(): void {
    this.load();
    this.candidatesService.getAll().subscribe(res => this.candidates.set(res.data));
    this.positionsService.getAll().subscribe(res => this.positions.set(res.data.filter(p => p.status === 'open')));
  }

  load(): void {
    this.appsService.getAll().subscribe({
      next: (res) => {
        this.items.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getByStatus(status: ApplicationStatus): Application[] {
    return this.items().filter(a => a.status === status);
  }

  statusLabel(status: ApplicationStatus): string {
    return STATUS_LABELS[status];
  }

  getNextStages(current: ApplicationStatus): ApplicationStatus[] {
    const idx = STATUS_ORDER.indexOf(current);
    return STATUS_ORDER.slice(idx + 1, idx + 3);
  }

  moveTo(id: number, status: ApplicationStatus): void {
    this.appsService.updateStatus(id, status).subscribe({
      next: () => {
        this.snackBar.open('Movido a ' + this.statusLabel(status), 'Cerrar', { duration: 2000 });
        this.load();
      },
      error: () => this.snackBar.open('Error al mover', 'Cerrar', { duration: 2000 }),
    });
  }

  createApplication(): void {
    this.appsService.create(this.newApp).subscribe({
      next: () => {
        this.snackBar.open('Postulación creada', 'Cerrar', { duration: 2000 });
        this.showNewForm = false;
        this.newApp = { candidateId: 0, positionId: 0, notes: '' };
        this.load();
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Error', 'Cerrar', { duration: 2000 }),
    });
  }
}