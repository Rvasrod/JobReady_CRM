import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CompaniesService } from '../../core/services/companies.service';

@Component({
  selector: 'app-companies-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="cancel()" aria-label="Volver">←</button>
      <span>{{ isEdit ? 'Editar empresa' : 'Nueva empresa' }}</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/dashboard">Dashboard</a>
      <a mat-button routerLink="/companies">Companies</a>
    </mat-toolbar>

    <div class="form-wrapper">
      <mat-card>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="full">
            <mat-label>Nombre *</mat-label>
            <input matInput formControlName="name" />
            <mat-error *ngIf="form.controls.name.hasError('required')">Nombre obligatorio</mat-error>
            <mat-error *ngIf="form.controls.name.hasError('minlength')">Mínimo 2 caracteres</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Sector</mat-label>
            <input matInput formControlName="sector" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Website</mat-label>
            <input matInput type="url" formControlName="website" placeholder="https://..." />
            <mat-error *ngIf="form.controls.website.hasError('pattern')">URL no válida</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Rating (0-5)</mat-label>
            <input matInput type="number" min="0" max="5" formControlName="rating" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Notas</mat-label>
            <textarea matInput rows="4" formControlName="notes"></textarea>
          </mat-form-field>

          <p class="error" *ngIf="error()">{{ error() }}</p>

          <div class="actions">
            <button mat-button type="button" (click)="cancel()">Cancelar</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Guardando...' : (isEdit ? 'Guardar' : 'Crear') }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-wrapper { max-width:640px; margin:24px auto; padding:0 16px; }
    .full { width:100%; }
    form { display:flex; flex-direction:column; gap:8px; }
    .actions { display:flex; justify-content:flex-end; gap:8px; margin-top:12px; }
    .error { color:#c62828; }
    .spacer { flex:1; }
  `],
})
export class CompaniesFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(CompaniesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEdit = false;
  id?: string;
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    sector: [''],
    website: ['', [Validators.pattern(/^(https?:\/\/).+/i)]],
    rating: [0, [Validators.min(0), Validators.max(5)]],
    notes: [''],
  });

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    if (this.id) {
      this.isEdit = true;
      this.service.getById(this.id).subscribe((res) => {
        const c = res.data;
        this.form.patchValue({
          name: c.name,
          sector: c.sector ?? '',
          website: c.website ?? '',
          rating: c.rating ?? 0,
          notes: c.notes ?? '',
        });
      });
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);
    const raw = this.form.getRawValue();
    const payload = {
      name: raw.name,
      sector: raw.sector || undefined,
      website: raw.website || undefined,
      rating: Number(raw.rating) || 0,
      notes: raw.notes || undefined,
    };
    const req$ = this.isEdit && this.id
      ? this.service.update(this.id, payload)
      : this.service.create(payload);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/companies']);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.message ?? 'Error al guardar');
      },
    });
  }

  cancel() {
    this.router.navigate(['/companies']);
  }
}
