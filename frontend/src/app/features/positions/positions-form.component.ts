import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PositionsService } from '../../core/services/positions.service';
import { Position, PositionStatus, Seniority } from '../../core/models/position.model';

@Component({
  selector: 'positions-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="page">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEdit() ? 'Editar' : 'Nueva' }} Vacante</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="save()">
            <mat-form-field appearance="outline">
              <mat-label>Título</mat-label>
              <input matInput formControlName="title">
              <mat-error>Título requerido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Departamento</mat-label>
              <input matInput formControlName="department">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Ubicación</mat-label>
              <input matInput formControlName="location">
            </mat-form-field>

            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>Seniority</mat-label>
                <mat-select formControlName="seniority">
                  <mat-option value="junior">Junior</mat-option>
                  <mat-option value="mid">Mid</mat-option>
                  <mat-option value="senior">Senior</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Estado</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="open">Abierta</mat-option>
                  <mat-option value="paused">Pausada</mat-option>
                  <mat-option value="closed">Cerrada</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Descripción</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Requisitos</mat-label>
              <textarea matInput formControlName="requirements" rows="3"></textarea>
            </mat-form-field>

            <div class="actions">
              <button mat-button type="button" routerLink="/positions">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">
                {{ saving() ? 'Guardando...' : (isEdit() ? 'Actualizar' : 'Crear') }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 700px; margin: 0 auto; }
    mat-form-field { width: 100%; margin-bottom: 8px; }
    .row { display: flex; gap: 16px; }
    .row mat-form-field { flex: 1; }
    .actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
  `],
})
export class PositionsFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private positionsService = inject(PositionsService);
  private snackBar = inject(MatSnackBar);

  saving = signal(false);
  isEdit = signal(false);
  id: number | null = null;

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    department: [''],
    location: [''],
    seniority: ['mid' as Seniority, Validators.required],
    status: ['open' as PositionStatus, Validators.required],
    description: [''],
    requirements: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.id = +id;
      this.isEdit.set(true);
      this.positionsService.getById(id).subscribe({
        next: (res) => {
          const p = res.data;
          this.form.patchValue({
            title: p.title,
            department: p.department || '',
            location: p.location || '',
            seniority: p.seniority,
            status: p.status,
            description: p.description || '',
            requirements: p.requirements || '',
          });
        },
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);

    const obs = this.id
      ? this.positionsService.update(this.id, this.form.value as Position)
      : this.positionsService.create(this.form.value as Position);

    obs.subscribe({
      next: () => {
        this.snackBar.open(this.isEdit() ? 'Actualizado' : 'Creado', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/positions']);
      },
      error: (err) => {
        this.saving.set(false);
        this.snackBar.open(err.error?.message || 'Error al guardar', 'Cerrar', { duration: 3000 });
      },
    });
  }
}