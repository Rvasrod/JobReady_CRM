import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule,
  ],
  templateUrl: './companies-form.component.html',
  styleUrl: './companies-form.component.scss',
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

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    if (!this.id) return;
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

  submit(): void {
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

  cancel(): void {
    this.router.navigate(['/companies']);
  }
}
