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
import { CandidatesService } from '../../core/services/candidates.service';
import { Candidate, Seniority } from '../../core/models/candidate.model';

@Component({
  selector: 'candidates-form',
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
          <mat-card-title>{{ isEdit() ? 'Editar' : 'Nuevo' }} Candidato</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="save()">
            <mat-form-field appearance="outline">
              <mat-label>Nombre</mat-label>
              <input matInput formControlName="name">
              <mat-error>Nombre requerido (mín 2 caracteres)</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email">
              <mat-error>Email válido requerido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Teléfono</mat-label>
              <input matInput formControlName="phone">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>LinkedIn URL</mat-label>
              <input matInput formControlName="linkedinUrl">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Seniority</mat-label>
              <mat-select formControlName="seniority">
                <mat-option value="junior">Junior</mat-option>
                <mat-option value="mid">Mid</mat-option>
                <mat-option value="senior">Senior</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Skills (separados por coma)</mat-label>
              <input matInput formControlName="skillsInput" (blur)="updateSkills()">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Notas</mat-label>
              <textarea matInput formControlName="notes" rows="3"></textarea>
            </mat-form-field>

            <div class="actions">
              <button mat-button type="button" routerLink="/candidates">Cancelar</button>
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
    .page { padding: 24px; max-width: 600px; margin: 0 auto; }
    mat-form-field { width: 100%; margin-bottom: 8px; }
    .actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
  `],
})
export class CandidatesFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private candidatesService = inject(CandidatesService);
  private snackBar = inject(MatSnackBar);

  saving = signal(false);
  isEdit = signal(false);
  id: number | null = null;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    linkedinUrl: [''],
    seniority: ['mid' as Seniority, Validators.required],
    skillsInput: [''],
    notes: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.id = +id;
      this.isEdit.set(true);
      this.candidatesService.getById(id).subscribe({
        next: (res) => {
          const c = res.data;
          this.form.patchValue({
            name: c.name,
            email: c.email,
            phone: c.phone || '',
            linkedinUrl: c.linkedinUrl || '',
            seniority: c.seniority,
            skillsInput: c.skills.join(', '),
            notes: c.notes || '',
          });
        },
      });
    }
  }

  updateSkills(): void {
    const input = this.form.get('skillsInput')?.value || '';
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    
    const skills = (this.form.get('skillsInput')?.value || '')
      .split(',')
      .map(s => s.trim())
      .filter(s => s);

    const payload = {
      name: this.form.get('name')?.value!,
      email: this.form.get('email')?.value!,
      phone: this.form.get('phone')?.value || undefined,
      linkedinUrl: this.form.get('linkedinUrl')?.value || undefined,
      seniority: this.form.get('seniority')?.value as Seniority,
      skills,
      notes: this.form.get('notes')?.value || undefined,
    };

    const obs = this.id
      ? this.candidatesService.update(this.id, payload)
      : this.candidatesService.create(payload);

    obs.subscribe({
      next: () => {
        this.snackBar.open(this.isEdit() ? 'Actualizado' : 'Creado', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/candidates']);
      },
      error: (err) => {
        this.saving.set(false);
        this.snackBar.open(err.error?.message || 'Error al guardar', 'Cerrar', { duration: 3000 });
      },
    });
  }
}